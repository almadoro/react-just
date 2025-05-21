import path from "node:path";
import type { Plugin } from "vite";
import { getRegisterModuleIdFromPath } from "../utils/client";
import buildApp from "./build-app";

type BuildOptions = { app: string; flightMimeType: string };

// TODO: handle chunks and code splitting
export default function build(options: BuildOptions): Plugin {
  /**
   * This is used to collect all the client entries found during the server
   * build and build a client entry.
   */
  const clientEntries: string[] = [];

  return {
    name: "react-just:build",
    apply: "build",
    config(config) {
      const root = config.root ?? process.cwd();
      const outDir = config.build?.outDir ?? "dist";
      const serverOutDir = path.join(outDir, ".temp-server");
      const clientOutDir = path.join(outDir, ".temp-client");

      // Server and client must use the same relative path to point to the same
      // asset
      const assetFileNames = path.join(ASSETS_DIR, "[hash].[ext]");

      return {
        appType: "custom",
        builder: {
          sharedConfigBuild: true,
          buildApp: (builder) => buildApp(builder, options.flightMimeType),
        },
        environments: {
          server: {
            consumer: "server",
            define: { "process.env.NODE_ENV": JSON.stringify("production") },
            build: {
              copyPublicDir: false, // Public dir is manually handled
              // Assets must be emitted by the server build since it can see
              // all references to them while the client can only see the
              // referenced by client components.
              emitAssets: true,
              outDir: serverOutDir,
              manifest: "manifest.json",
              rollupOptions: {
                input: path.resolve(root, options.app),
                output: {
                  entryFileNames: "[name].js",
                  assetFileNames,
                },
              },
            },
          },
          client: {
            consumer: "client",
            define: { "process.env.NODE_ENV": JSON.stringify("production") },
            build: {
              copyPublicDir: false, // Public dir is manually handled
              emitAssets: false, // Assets are handled in the server build
              outDir: clientOutDir,
              manifest: "manifest.json",
              rollupOptions: {
                input: ENTRY_MODULE_ID,
                output: {
                  entryFileNames: path.join(ASSETS_DIR, "[hash].js"),
                  assetFileNames,
                },
              },
            },
          },
        },
      };
    },
    moduleParsed(moduleInfo) {
      if (this.environment.name !== "server") return;

      const isClientFile = moduleInfo.meta.reactUseClient?.transformed;

      if (isClientFile) clientEntries.push(moduleInfo.id);
    },
    resolveId(id) {
      if (id === ENTRY_MODULE_ID) return RESOLVED_ENTRY_MODULE_ID;
    },
    load(id) {
      if (id === RESOLVED_ENTRY_MODULE_ID)
        return getClientEntryCode(clientEntries);
    },
  };
}

const ASSETS_DIR = "assets";

const ENTRY_MODULE_ID = "/virtual:client-entry";
const RESOLVED_ENTRY_MODULE_ID = "\0" + ENTRY_MODULE_ID;

function getClientEntryCode(entries: string[]) {
  let code = `import { hydrateFromWindowFlight, registerModule } from "react-just/client";`;

  for (let i = 0; i < entries.length; i++) {
    const entryPath = entries[i];
    const moduleId = getRegisterModuleIdFromPath(entryPath);
    code += `import * as entry_${i} from "${entryPath}";`;
    code += `registerModule("${moduleId}", entry_${i});`;
  }

  code += "hydrateFromWindowFlight();";
  return code;
}
