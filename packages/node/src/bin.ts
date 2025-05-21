#!/usr/bin/env node

import { program } from "commander";
import http from "node:http";
import { createHandleFunction as createRequestListener } from "./handle";

// React specs NODE_ENV to be set to "production" when using a production
// client build.
if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";

program
  .requiredOption("-p, --port <port>", "Port to listen on")
  .argument("<app>", "App folder. Must contain a manifest.json file");

program.parse(process.argv);

const [appPath] = program.args;
const { port } = program.opts();

const middleware = await createRequestListener(appPath);

const server = http.createServer(middleware);

server.listen(port, () => {
  console.log(`React Just server running on port ${port}`);
});
