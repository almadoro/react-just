import { AppProps } from "@/types";
import { renderToPipeableStream as renderToPipeableHtmlStream } from "@/types/fizz.node";
import {
  decodePayloadIncomingMessage,
  renderToPipeableStream as renderToPipeableRscStream,
} from "@/types/flight.node";
import fs from "node:fs/promises";
import path from "node:path";
import type React from "react";
import { ComponentType } from "react";
import { Plugin } from "vite";
import { CLIENT_HOT_MODULES } from "./client-hot";
import { CSS_MODULES } from "./css";
import { ENVIRONMENTS } from "./environments";
import { CLIENT_MODULES, RESOLVED_CLIENT_MODULES } from "./use-client";
import { SERVER_FUNCTIONS_MODULES } from "./use-server";

type EntriesOptions = {
  app?: string;
};

export default function entries(options: EntriesOptions): Plugin {
  let appEntryId: string;

  return {
    name: "react-just:entries",
    async config(config) {
      const root = config.root ?? process.cwd();

      appEntryId = await resolveAppEntryId(root, options.app);

      return {
        root,
        environments: {
          [ENVIRONMENTS.CLIENT]: {
            optimizeDeps: {
              include: [
                "react",
                "react/jsx-runtime",
                "react/jsx-dev-runtime",
                "react-just/client",
              ],
            },
          },
          [ENVIRONMENTS.FIZZ_NODE]: {
            optimizeDeps: {
              include: [
                "react",
                "react/jsx-runtime",
                "react/jsx-dev-runtime",
                "react-just/fizz.node",
              ],
            },
          },
          [ENVIRONMENTS.FLIGHT_NODE]: {
            optimizeDeps: {
              entries: [appEntryId],
              include: [
                "react",
                "react/jsx-runtime",
                "react/jsx-dev-runtime",
                "react-just/flight.node",
              ],
            },
          },
        },
      };
    },
    resolveId(id) {
      switch (id) {
        case FLIGHT_ENTRY_NODE:
          return RESOLVED_FLIGHT_ENTRY_NODE;
        case FIZZ_ENTRY_NODE:
          return RESOLVED_FIZZ_ENTRY_NODE;
        case CLIENT_ENTRY:
          return RESOLVED_CLIENT_ENTRY;
        case SCAN_USE_CLIENT_ENTRY:
          return appEntryId;
        case SCAN_USE_SERVER_ENTRY:
          return RESOLVED_CLIENT_MODULES;
      }
    },
    async load(id) {
      switch (id) {
        case RESOLVED_FLIGHT_ENTRY_NODE:
          return getFlightEntry(appEntryId);
        case RESOLVED_FIZZ_ENTRY_NODE:
          return getFizzEntry();
        case RESOLVED_CLIENT_ENTRY:
          return getClientEntry();
      }
    },
  };
}

async function resolveAppEntryId(root: string, app?: string) {
  if (app) return toJsPath(path.resolve(root, app));

  for (const entryPath of APP_ENTRY_PATHS) {
    const entry = path.resolve(root, entryPath);
    try {
      await fs.access(entry, fs.constants.F_OK);
      return toJsPath(entry);
    } catch {}
  }

  throw new Error(
    `App entry not found. Specify the entry path with the "app" option or ` +
      `create a file named one of the following: ${APP_ENTRY_PATHS.join(", ")}`,
  );
}

function toJsPath(path: string) {
  return path.replace(/\\/g, "/");
}

const APP_ENTRY_PATHS = [
  "src/index.tsx",
  "src/index.jsx",
  "src/index.ts",
  "src/index.js",
];

export const FLIGHT_ENTRY_NODE = "/virtual:react-just/flight-entry.node";
const RESOLVED_FLIGHT_ENTRY_NODE = "\0" + FLIGHT_ENTRY_NODE;

function getFlightEntry(appEntryId: string) {
  return (
    `import React from "react";` +
    `import { decodePayloadIncomingMessage, renderToPipeableStream } from "react-just/flight.node";` +
    `import App from "${appEntryId}";` +
    `import "${SERVER_FUNCTIONS_MODULES}";` +
    `export { App, decodePayloadIncomingMessage, renderToPipeableStream, React };`
  );
}

export type FlightEntryNodeModule = {
  App: ComponentType<AppProps>;
  decodePayloadIncomingMessage: typeof decodePayloadIncomingMessage;
  renderToPipeableStream: typeof renderToPipeableRscStream;
  React: typeof React;
};

export const FIZZ_ENTRY_NODE = "/virtual:react-just/fizz-entry.node";
const RESOLVED_FIZZ_ENTRY_NODE = "\0" + FIZZ_ENTRY_NODE;

function getFizzEntry() {
  return (
    `import { renderToPipeableStream } from "react-just/fizz.node";` +
    `import "${CLIENT_MODULES}";` +
    `export { renderToPipeableStream };`
  );
}

export type FizzEntryNodeModule = {
  renderToPipeableStream: typeof renderToPipeableHtmlStream;
};

export const CLIENT_ENTRY = "/virtual:react-just/client-entry";
const RESOLVED_CLIENT_ENTRY = "\0" + CLIENT_ENTRY;

function getClientEntry() {
  return (
    `import "${CLIENT_HOT_MODULES}";` +
    `import "${CSS_MODULES}";` +
    `import "${CLIENT_MODULES}";` +
    `import { hydrateFromWindowStream } from "react-just/client";` +
    `hydrateFromWindowStream();`
  );
}

export const SCAN_USE_CLIENT_ENTRY =
  "/virtual:react-just/scan-use-client-entry";
export const SCAN_USE_SERVER_ENTRY =
  "/virtual:react-just/scan-use-server-entry";
