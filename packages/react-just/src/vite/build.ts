import path from "node:path";
import type { Plugin } from "vite";
import { getRegisterModuleIdFromPath } from "./utils/client";

type BuildOptions = { entry: string };

export default function build(options: BuildOptions): Plugin {
  const clientEntries: string[] = [];

  return {
    name: "react-just:build",
    apply: "build",
    config() {
      return {
        appType: "custom",
        builder: {
          sharedConfigBuild: true,
          async buildApp(builder) {
            await builder.build(builder.environments.server);
            // It is required that the server build is executed first to catch all
            // the client entries.
            await builder.build(builder.environments.client);
          },
        },
        environments: {
          server: {
            consumer: "server",
            define: { "process.env.NODE_ENV": JSON.stringify("production") },
            build: {
              outDir: "dist/server",
              rollupOptions: {
                input: { index: path.resolve(options.entry) },
                output: { entryFileNames: "index.js" },
              },
            },
          },
          client: {
            consumer: "client",
            define: { "process.env.NODE_ENV": JSON.stringify("production") },
            build: {
              minify: false,
              outDir: "dist/client",
              rollupOptions: {
                input: { index: ENTRY_MODULE_ID },
                output: { entryFileNames: "index.js" },
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

export const ENTRY_MODULE_ID = "/virtual:client-entry";

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
