#!/usr/bin/env node

import { program } from "commander";
import http from "node:http";
import { DEFAULT_BUILD_PATH } from "./constants";
import { createHandleFunction } from "./handle";

program
  .requiredOption("-p, --port [port]", "Port to listen on", "3000")
  .argument(
    "[build-path]",
    "Build directory. Must contain a manifest.json file",
    DEFAULT_BUILD_PATH,
  );

program.parse(process.argv);

const [buildPath = DEFAULT_BUILD_PATH] = program.args;
const { port = "3000" } = program.opts();

try {
  const middleware = await createHandleFunction(buildPath);

  const server = http.createServer(middleware);

  server.listen(port, () => {
    console.log(`ReactJust server running on port ${port}`);
  });
} catch (error) {
  if (error instanceof Error) console.error(error.message);
  else console.error(error);

  process.exit(1);
}
