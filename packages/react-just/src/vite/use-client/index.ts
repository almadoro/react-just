import { generate } from "astring";
import type { Plugin as EsbuildPlugin } from "esbuild";
import fs from "node:fs/promises";
import { DevEnvironment, Plugin } from "vite";
import {
  ENVIRONMENTS,
  isClientLikeEnvironment,
  isFlightEnvironment,
} from "../environments";
import UseClientApi from "./api";
import { getTransformOptions } from "./environments";
import {
  initPackagesClientModules,
  PACKAGES_CLIENT_MODULES,
} from "./packages-modules";
import parse from "./parse";
import transform from "./transform";

export type { UseClientApi };

export default function useClient() {
  const consumerDevEnvironments: DevEnvironment[] = [];
  const api = new UseClientApi(consumerDevEnvironments);

  return {
    name: PLUGIN_NAME,
    api,
    // We should apply this plugin before others because the "use client"
    // directive must appear at the top and other plugins may add code
    // before it (e.g. vitejs react plugin on development)
    enforce: "pre",
    async config() {
      await initPackagesClientModules();
    },
    applyToEnvironment(environment) {
      return shouldApply(environment.name);
    },
    configEnvironment(environment) {
      if (!shouldApply(environment)) return;

      async function onModuleTransformed(ids: string[]) {
        if (isFlightEnvironment(environment)) await api.addModules(ids);
      }

      const include: string[] = [];

      if (isClientLikeEnvironment(environment))
        include.push(PACKAGES_CLIENT_MODULES);

      return {
        optimizeDeps: {
          // We need to force reoptimization to catch client modules
          // on optimized dependencies.
          // OPTIMIZE: Cache the client modules on optimized
          // dependencies to avoid reoptimization on restart.
          force: isFlightEnvironment(environment),
          include,
          esbuildOptions: {
            plugins: [getEsbuildPlugin(environment, onModuleTransformed)],
          },
        },
      };
    },
    configureServer(server) {
      for (const environment of Object.values(server.environments)) {
        if (isClientLikeEnvironment(environment.name))
          consumerDevEnvironments.push(environment);
      }
    },
    async transform(code, id) {
      if (!EXTENSIONS_REGEX.test(id)) return;

      const program = await parse(code, id, {
        jsxDev: this.environment.config.mode === "development",
      });

      const moduleId = cleanId(id);

      const transformOptions = getTransformOptions(
        this.environment.name,
        moduleId,
      );

      const { transformed } = transform(program, transformOptions);

      if (!transformed) return;

      if (isFlightEnvironment(this.environment.name))
        await api.addModules([moduleId]);

      return generate(program);
    },
    resolveId(id) {
      if (id === CLIENT_MODULES) return RESOLVED_CLIENT_MODULES;
    },
    load(id) {
      if (id === RESOLVED_CLIENT_MODULES)
        return getClientModulesCode(api.getAppModules());
    },
  } satisfies Plugin<UseClientApi>;
}

function shouldApply(environment: string) {
  return Object.values(ENVIRONMENTS).includes(environment);
}

function getEsbuildPlugin(
  environment: string,
  onEnd: (moduleIds: string[]) => Promise<void>,
): EsbuildPlugin {
  return {
    name: PLUGIN_NAME,
    setup(build) {
      const moduleIds = new Set<string>();

      build.onLoad(
        { filter: EXTENSIONS_REGEX, namespace: "file" },
        async ({ path }) => {
          const transformOptions = getTransformOptions(environment, path);

          const code = await fs.readFile(path, "utf-8");

          const ast = await parse(code, path);

          const { transformed } = transform(ast, transformOptions);

          if (!transformed) return;

          moduleIds.add(path);

          return { contents: generate(ast), loader: "js" };
        },
      );

      build.onEnd(() => onEnd([...moduleIds]));
    },
  };
}

const PLUGIN_NAME = "react-just:use-client";

// Vite will use query params like `?v=` sometimes.
const EXTENSIONS_REGEX = /\.(js|jsx|mjs|ts|tsx|mts)(\?[^\/]+)?$/;

function cleanId(id: string) {
  return id.split("?")[0];
}

export const CLIENT_MODULES = "/virtual:react-just/client-modules";
export const RESOLVED_CLIENT_MODULES = "\0" + CLIENT_MODULES;

function getClientModulesCode(appModuleIds: string[]) {
  let code = `import "${PACKAGES_CLIENT_MODULES}";`;

  for (const id of appModuleIds) {
    code += `import "${id}";`;
  }

  return code;
}
