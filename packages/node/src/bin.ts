#!/usr/bin/env node

import { HandleFunction } from "@/types/handle";
import { program } from "commander";
import mime from "mime/lite";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import {
  DEFAULT_BUILD_PATH,
  SERVER_DIR,
  SERVER_ENTRY_FILENAME,
  STATIC_DIR,
} from "./constants";

program
  .option("-p, --port <number>", "Port to listen on", "3000")
  .option("--no-static", "Disable static files serving")
  .argument("[build-path]", "Build directory", DEFAULT_BUILD_PATH);

program.parse(process.argv);

const [buildPath = DEFAULT_BUILD_PATH] = program.args;
const { port, static: serverStatic = true } = program.opts();

try {
  await assertIsDirectory(path.resolve(buildPath));

  const { default: handle } = await import(
    path.resolve(buildPath, SERVER_DIR, SERVER_ENTRY_FILENAME)
  );

  const server = http.createServer(
    serverStatic ? await handleWithStaticFiles(handle) : handle,
  );

  server.listen(port, () => {
    console.log(`ReactJust server running on port ${port}`);
  });
} catch (error) {
  if (error instanceof Error) console.error(error.message);
  else console.error(error);

  process.exit(1);
}

async function handleWithStaticFiles(
  handle: HandleFunction,
): Promise<HandleFunction> {
  const staticDir = path.resolve(buildPath, STATIC_DIR);

  await assertIsDirectory(staticDir);

  return async (req, res) => {
    const staticFile = await getStaticFile(staticDir, req.url ?? "");

    if (staticFile) {
      res.statusCode = 200;
      res.setHeader("content-type", staticFile.mimeType);
      res.end(staticFile.buffer);
      return;
    }

    handle(req, res);
  };
}

async function assertIsDirectory(dir: string) {
  try {
    await fs.access(dir, fs.constants.F_OK);
  } catch {
    throw new Error(`Expected ${dir} directory to exist`);
  }

  const stat = await fs.stat(dir);
  if (!stat.isDirectory()) throw new Error(`Expected ${dir} to be a directory`);
}

async function getStaticFile(staticDir: string, url: string) {
  try {
    const relativePath = url.replace(/^\/|\/$/g, "");

    const staticFilePath = path.resolve(staticDir, relativePath);

    // Prevent directory traversal attacks
    if (!staticFilePath.startsWith(staticDir)) return null;

    return {
      buffer: await fs.readFile(staticFilePath),
      mimeType: mime.getType(staticFilePath) ?? "application/octet-stream",
    };
  } catch {
    return null;
  }
}
