import mime from "mime/lite";
import fs from "node:fs/promises";
import { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import {
  Manifest,
  renderToFlightPipeableStream,
  renderToHtmlPipeableStream,
} from "react-just/server";

export async function createHandleFunction(buildPath: string) {
  try {
    await fs.access(path.resolve(buildPath), fs.constants.F_OK);
  } catch {
    throw new Error("Invalid build path: directory does not exist");
  }

  const build = await fs.stat(path.resolve(buildPath));
  if (!build.isDirectory())
    throw new Error("Invalid build path: not a directory");

  const manifest = await readManifest(path.resolve(buildPath, "manifest.json"));

  const { app } = manifest;
  const { default: App } = await import(path.resolve(buildPath, app.server));

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

    const staticFilePath = path.resolve(
      buildPath,
      manifest.publicDir,
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
  let manifestStr: string;
  let manifest: Manifest;

  try {
    manifestStr = await fs.readFile(manifestPath, "utf-8");
  } catch {
    throw new Error("Invalid manifest: file does not exist");
  }

  try {
    manifest = JSON.parse(manifestStr) as Manifest;
  } catch {
    throw new Error("Invalid manifest: not a json file");
  }

  if (!("version" in manifest))
    throw new Error("Invalid manifest: missing version");

  if (manifest.version !== "1")
    throw new Error("Invalid manifest: unsupported version");

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
