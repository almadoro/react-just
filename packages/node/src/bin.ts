#!/usr/bin/env node

import { program } from "commander";
import http from "node:http";

program
  .requiredOption("-p, --port <port>", "Port to listen on")
  .argument("<build>", "Build directory. Must contain a manifest.json file");

program.parse(process.argv);

const [buildPath] = program.args;
const { port } = program.opts();

// React specs NODE_ENV to be set to "production" when using a production
// client build.
if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";

try {
  // We need to modify the process.env before importing any react package
  // to properly set NODE_ENV.
  const { createHandleFunction } = await import("./handle");

  const middleware = await createHandleFunction(buildPath);

  const server = http.createServer(middleware);

  server.listen(port, () => {
    console.log(`react-just server running on port ${port}`);
  });
} catch (error) {
  if (error instanceof Error) console.error(error.message);
  else console.error(error);

  process.exit(1);
}
