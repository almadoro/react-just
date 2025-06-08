import path from "node:path";
import type { Plugin } from "vite";
import {
  getInitializationCode,
  getModulesRegisteringCodeProduction,
} from "../utils/client";
import { resolveAppEntry } from "../utils/resolve-entry";
import buildApp from "./build-app";

type BuildOptions = { app?: string; flightMimeType: string };

// TODO: handle chunks and code splitting
export default function build(options: BuildOptions): Plugin {
  const clientModulesIds: string[] = [];

  return {
    name: "react-just:build",
    apply: "build",
    async config(config) {
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
                input: await resolveAppEntry(root, options.app),
                output: {
                  format: "esm",
                  entryFileNames: "[name].mjs",
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
                input: CLIENT_ENTRY_MODULE_ID,
                output: {
                  format: "esm",
                  entryFileNames: path.join(ASSETS_DIR, "[hash].mjs"),
                  assetFileNames,
                },
              },
            },
          },
        },
      };
    },
    buildEnd() {
      // Server build must be generated before the client build for this method
      // to work.
      for (const id of this.getModuleIds()) {
        const moduleInfo = this.getModuleInfo(id);
        const isClientFile = moduleInfo?.meta.reactUseClient?.transformed;
        if (isClientFile) clientModulesIds.push(id);
      }
    },
    resolveId(id) {
      if (id === CLIENT_ENTRY_MODULE_ID) return RESOLVED_CLIENT_ENTRY_MODULE_ID;
      if (id === APP_MODULES_MODULE_ID) return RESOLVED_APP_MODULES_MODULE_ID;
    },
    load(id) {
      if (id === RESOLVED_CLIENT_ENTRY_MODULE_ID)
        return getClientEntryCode(options.flightMimeType);
      if (id === RESOLVED_APP_MODULES_MODULE_ID)
        return getAppModulesCode(
          clientModulesIds,
          this.environment.config.root,
        );
    },
  };
}

const ASSETS_DIR = "assets";

const CLIENT_ENTRY_MODULE_ID = "/virtual:react-just/client-entry";
const RESOLVED_CLIENT_ENTRY_MODULE_ID = "\0" + CLIENT_ENTRY_MODULE_ID;

function getClientEntryCode(flightMimeType: string) {
  return (
    `import "${APP_MODULES_MODULE_ID}";` + getInitializationCode(flightMimeType)
  );
}

const APP_MODULES_MODULE_ID = "/virtual:react-just/app-modules";
const RESOLVED_APP_MODULES_MODULE_ID = "\0" + APP_MODULES_MODULE_ID;

function getAppModulesCode(clientModulesIds: string[], root: string) {
  return getModulesRegisteringCodeProduction(clientModulesIds, root);
}
