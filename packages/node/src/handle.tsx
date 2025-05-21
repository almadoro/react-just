import mime from "mime/lite";
import fs from "node:fs/promises";
import { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import {
  Manifest,
  renderToFlightPipeableStream,
  renderToHtmlPipeableStream,
} from "react-just/server";

export async function createHandleFunction(manifestPath: string) {
  const rootDir = path.resolve(path.dirname(manifestPath));

  const manifest = await readManifest(manifestPath);

  const { app } = manifest;
  const { default: App } = await import(path.resolve(rootDir, app.server));

  const AppRoot = () => (
    <>
      {app.js.map((src) => (
        <script key={src} src={src} async />
      ))}
      {app.css.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <App />
    </>
  );

  return async (req: IncomingMessage, res: ServerResponse) => {
    const pathname = req.url?.replace(/^\/|\/$/g, "") ?? "";

    const staticFilePath = path.resolve(rootDir, manifest.publicDir, pathname);
    const staticFile = await getStaticFile(staticFilePath);

    if (staticFile) {
      const contentType =
        mime.getType(staticFilePath) ?? "application/octet-stream";
      res.statusCode = 200;
      res.setHeader("content-type", contentType);
      res.end(staticFile);
      return;
    }

    if (req.headers.accept?.includes(manifest.flight.mimeType)) {
      res.statusCode = 200;
      res.setHeader("content-type", manifest.flight.mimeType);
      const flightStream = renderToFlightPipeableStream(<AppRoot />);
      flightStream.pipe(res);
      return;
    }

    res.statusCode = 200;
    res.setHeader("content-type", "text/html");
    const htmlStream = renderToHtmlPipeableStream(<AppRoot />);
    htmlStream.pipe(res);
  };
}

async function readManifest(manifestPath: string) {
  let manifest: Manifest;

  try {
    const manifestStr = await fs.readFile(manifestPath, "utf-8");

    manifest = JSON.parse(manifestStr) as Manifest;
  } catch {
    throw new Error("Invalid manifest file");
  }

  if (!("version" in manifest) || manifest.version !== "1")
    throw new Error("Invalid manifest version");

  return manifest;
}

async function getStaticFile(filePath: string) {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    const file = await fs.readFile(filePath);
    return file;
  } catch {
    return null;
  }
}
