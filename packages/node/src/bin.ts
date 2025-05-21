#!/usr/bin/env node

import { program } from "commander";
import http from "node:http";
import { createHandleFunction as createRequestListener } from "./handle";

// React specs NODE_ENV to be set to "production" when using a production
// client build.
if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";

program
  .requiredOption("-p, --port <port>", "Port to listen on")
  .argument("<build>", "Build directory. Must contain a manifest.json file");

program.parse(process.argv);

const [buildPath] = program.args;
const { port } = program.opts();

try {
  const middleware = await createRequestListener(buildPath);

  const server = http.createServer(middleware);

  server.listen(port, () => {
    console.log(`react-just server running on port ${port}`);
  });
} catch (error) {
  if (error instanceof Error) console.error(error.message);
  else console.error(error);

  process.exit(1);
}
