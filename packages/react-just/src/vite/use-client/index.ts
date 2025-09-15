import { generate } from "astring";
import type { Plugin as EsbuildPlugin } from "esbuild";
import fs from "node:fs/promises";
import { OutputBundle } from "rollup";
import { DevEnvironment, Plugin } from "vite";
import {
  ENVIRONMENTS,
  isClientLikeEnvironment,
  isFlightEnvironment,
} from "../environments";
import ClientModules, {
  OPTIMIZED_CLIENT_MODULES,
  OPTIMIZED_CLIENT_MODULES_DIR,
} from "./client-modules";
import { getTransformOptions } from "./environments";
import parse from "./parse";
import transform from "./transform";

export default function useClient(): Plugin {
  const flightDevEnvironments: DevEnvironment[] = [];
  const flightBuildBundles: OutputBundle[] = [];
  const clientModules = new ClientModules();

  function removeUnusedClientModules() {
    // NOTE: Currently, there is no trivial way to remove client modules under
    // optimized dependencies. This only affects development.
    const usedModulesIds = new Set<string>();

    for (const environment of flightDevEnvironments) {
      for (const module of environment.moduleGraph.idToModuleMap.values()) {
        if (module.importers.size !== 0) usedModulesIds.add(module.id!);
        // Invalidate the module to force it to be transformed next time it's
        // referenced.
        else environment.moduleGraph.invalidateModule(module);
      }
    }

    for (const bundle of flightBuildBundles) {
      for (const key in bundle) {
        const file = bundle[key];
        if (file.type === "asset") continue;

        for (const moduleId in file.modules) {
          usedModulesIds.add(moduleId);
        }
      }
    }

    for (const moduleId of clientModules.nonOptimizedModuleIdsIterator()) {
      if (!usedModulesIds.has(moduleId))
        clientModules.removeNonOptimized(moduleId);
    }
  }

  return {
    name: PLUGIN_NAME,
    sharedDuringBuild: true,
    // We should apply this plugin before others because the "use client"
    // directive must appear at the top and other plugins may add code
    // before it (e.g. vitejs react plugin on development)
    enforce: "pre",
    async config() {
      await clientModules.initOptimized();
      return {
        resolve: {
          alias: { [OPTIMIZED_CLIENT_MODULES]: OPTIMIZED_CLIENT_MODULES_DIR },
        },
      };
    },
    applyToEnvironment(environment) {
      return shouldApply(environment.name);
    },
    configEnvironment(environment) {
      if (!shouldApply(environment)) return;

      async function onModuleTransformed(ids: string[]) {
        // Track only client modules that are referenced from the flight
        // environment since these are the ones that serve as entry points.
        if (isFlightEnvironment(environment))
          clientModules.addOptimized(...ids);
      }

      const include: string[] = [];

      if (isClientLikeEnvironment(environment))
        include.push(OPTIMIZED_CLIENT_MODULES);

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
        if (isFlightEnvironment(environment.name))
          flightDevEnvironments.push(environment);
        else if (isClientLikeEnvironment(environment.name))
          clientModules.addClientLikeEnvironment(environment);
      }
    },
    async transform(code, id) {
      if (!EXTENSIONS_REGEX.test(id)) return;

      if (isClientLikeEnvironment(this.environment.name)) {
        const isEntry = clientModules.has(id);
        // We can skip transformation of "use client" annotated modules that
        // are not used as entry points.
        if (!isEntry) return;
      }

      const isDev = this.environment.config.mode === "development";

      const program = await parse(code, id, { jsxDev: isDev });

      const moduleId = cleanId(id);

      const transformOptions = getTransformOptions({
        environment: this.environment.name,
        moduleId,
        minimizeIds: !isDev,
      });

      const { transformed } = transform(program, transformOptions);

      // Track only client modules that are referenced from the flight
      // environment since these are the ones that serve as entry points.
      if (isFlightEnvironment(this.environment.name)) {
        if (!transformed) {
          // Is possible that the module changed from client-only to
          // unspecified. In that case, we need to remove it.
          clientModules.removeNonOptimized(moduleId);
        } else {
          clientModules.addNonOptimized(moduleId);
        }
      }

      if (!transformed) return;

      return generate(program);
    },
    generateBundle(_, bundle) {
      if (isFlightEnvironment(this.environment.name))
        flightBuildBundles.push(bundle);
    },
    resolveId(id) {
      if (id === CLIENT_MODULES) return RESOLVED_CLIENT_MODULES;
    },
    load(id) {
      if (id === RESOLVED_CLIENT_MODULES) {
        removeUnusedClientModules();
        return clientModules.getEntryCode(this.environment);
      }
    },
  };
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
      const isDepPrebundle = build.initialOptions.plugins?.some(
        (p) => p.name === "vite:dep-pre-bundle",
      );

      const moduleIds = new Set<string>();

      build.onLoad(
        { filter: EXTENSIONS_REGEX, namespace: "file" },
        async ({ path }) => {
          const transformOptions = getTransformOptions({
            environment,
            moduleId: path,
            // Optimized dependencies are used only in development. There
            // is not need to minimize ids.
            minimizeIds: false,
          });

          const code = await fs.readFile(path, "utf-8");

          const program = await parse(code, path);

          const { transformed } = transform(program, transformOptions);

          if (!transformed) return;

          moduleIds.add(path);

          return { contents: generate(program), loader: "js" };
        },
      );

      // We are interested in the modules on prebundled dependencies.
      // Ignore when used in scan environment.
      if (isDepPrebundle) build.onEnd(() => onEnd([...moduleIds]));
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
