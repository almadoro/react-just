import mime from "mime/lite";
import fs from "node:fs/promises";
import { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import type React from "react";
import type { AppEntryProps } from "react-just";
import type { renderToPipeableStream as renderToPipeableHtmlStream } from "react-just/fizz.node";
import type { renderToPipeableStream as renderToPipeableRscStream } from "react-just/flight.node";
import { createHandle } from "react-just/handle.node";
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
    rscMimeType,
  } = (await import(entry)) as EntryModule;

  const Root = (props: AppEntryProps) =>
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

  const handle = createHandle({
    App: Root,
    React,
    renderToPipeableHtmlStream,
    renderToPipeableRscStream,
    rscMimeType,
  });

  return async (req: IncomingMessage, res: ServerResponse) => {
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

    handle(req, res);
  };
}

type EntryModule = {
  App: React.ComponentType<AppEntryProps>;
  React: typeof React;
  renderToPipeableHtmlStream: typeof renderToPipeableHtmlStream;
  renderToPipeableRscStream: typeof renderToPipeableRscStream;
  resources: {
    css: string[];
    js: string[];
    publicDir: string;
  };
  rscMimeType: string;
};

async function getStaticFile(filePath: string) {
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}
