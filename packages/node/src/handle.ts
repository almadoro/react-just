import mime from "mime/lite";
import fs from "node:fs/promises";
import { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { Readable } from "node:stream";
import { TLSSocket } from "node:tls";
import type { AppEntryProps } from "react-just";
import { ENTRY_PATH } from "./constants";

export async function createHandleFunction(buildPath: string) {
  try {
    await fs.access(path.resolve(buildPath), fs.constants.F_OK);
  } catch {
    throw new Error(
      `Invalid build path: ${buildPath} directory does not exist`,
    );
  }

  const build = await fs.stat(path.resolve(buildPath));
  if (!build.isDirectory())
    throw new Error(`Invalid build path: ${buildPath} not a directory`);

  const entry = path.resolve(buildPath, ENTRY_PATH);

  const {
    App,
    React,
    renderToPipeableHtmlStream,
    renderToPipeableRscStream,
    resources,
    rcsMimeType,
  } = (await import(entry)) as EntryModule;

  const AppRoot = (props: AppEntryProps) =>
    React.createElement(
      React.Fragment,
      null,
      resources.js.map((src) =>
        React.createElement("script", {
          key: src,
          src,
          async: true,
        }),
      ),
      resources.css.map((href) =>
        React.createElement("link", {
          key: href,
          href,
          rel: "stylesheet",
        }),
      ),
      React.createElement(App, props),
    );

  return async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.end("Method not allowed");
      return;
    }

    const pathname = req.url?.replace(/^\/|\/$/g, "") ?? "";

    const staticFilePath = path.resolve(
      buildPath,
      resources.publicDir,
      pathname,
    );

    const staticFile = await getStaticFile(staticFilePath);

    if (staticFile) {
      const contentType =
        mime.getType(staticFilePath) ?? "application/octet-stream";
      res.statusCode = 200;
      res.setHeader("content-type", contentType);
      res.end(staticFile);
      return;
    }

    const request = incomingMessageToRequest(req);

    const rscStream = renderToPipeableRscStream(
      React.createElement(AppRoot, { req: request }),
    );

    if (req.headers.accept?.includes(rcsMimeType)) {
      res.statusCode = 200;
      res.setHeader("content-type", rcsMimeType);
      rscStream.pipe(res);
      return;
    }

    res.statusCode = 200;
    res.setHeader("content-type", "text/html");
    const htmlStream = renderToPipeableHtmlStream(rscStream);
    htmlStream.pipe(res);
  };
}

type EntryModule = {
  App: React.ComponentType<AppEntryProps>;
  React: typeof import("react");
  renderToPipeableHtmlStream: typeof import("react-just/fizz.node").renderToPipeableStream;
  renderToPipeableRscStream: typeof import("react-just/flight.node").renderToPipeableStream;
  resources: {
    css: string[];
    js: string[];
    publicDir: string;
  };
  rcsMimeType: string;
};

async function getStaticFile(filePath: string) {
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

function incomingMessageToRequest(incomingMessage: IncomingMessage): Request {
  const { method, headers: rawHeaders, url = "" } = incomingMessage;

  const headers = new Headers();
  for (const [key, value] of Object.entries(rawHeaders)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        headers.append(key, v);
      }
    } else if (typeof value === "string") {
      headers.set(key, value);
    }
  }

  const isHttps =
    incomingMessage.socket instanceof TLSSocket ||
    rawHeaders["x-forwarded-proto"] === "https";

  const protocol = isHttps ? "https" : "http";

  const host = rawHeaders["x-forwarded-host"] || headers.get("host");

  let body: BodyInit | undefined = undefined;
  if (method !== "GET" && method !== "HEAD")
    body = Readable.toWeb(incomingMessage) as ReadableStream;

  return new Request(new URL(url, `${protocol}://${host}`), { headers, body });
}
