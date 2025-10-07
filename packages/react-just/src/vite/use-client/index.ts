import { generate } from "astring";
import type { Plugin as EsbuildPlugin } from "esbuild";
import fs from "node:fs/promises";
import { OutputBundle } from "rollup";
import {
  DevEnvironment,
  parseAstAsync,
  Plugin,
  transformWithEsbuild,
} from "vite";
import {
  ENVIRONMENTS,
  isClientLikeEnvironment,
  isScanUseClientModulesEnvironment,
  isScanUseServerModulesEnvironment,
} from "../environments";
import { cleanId } from "../utils";
import ClientModules, {
  OPTIMIZED_CLIENT_MODULES,
  OPTIMIZED_CLIENT_MODULES_DIR,
} from "./client-modules";
import { couldBeUseClientModule, getIsUseClientModule } from "./directive";
import { getTransformOptions } from "./environments";
import transform from "./transform";

export default function useClient(): Plugin {
  const scanUseClientModulesDevEnvironments: DevEnvironment[] = [];
  const scanUseClientModulesBuildBundles: OutputBundle[] = [];
  const clientModules = new ClientModules();

  function removeUnusedClientModules() {
    const usedModulesIds = new Set<string>();

    for (const environment of scanUseClientModulesDevEnvironments) {
      for (const module of environment.moduleGraph.idToModuleMap.values()) {
        if (module.importers.size !== 0) usedModulesIds.add(module.id!);
        // Invalidate the module to force it to be transformed next time it's
        // referenced.
        else environment.moduleGraph.invalidateModule(module);
      }
    }

    for (const bundle of scanUseClientModulesBuildBundles) {
      for (const key in bundle) {
        const file = bundle[key];
        if (file.type === "asset") continue;

        for (const moduleId in file.modules) {
          usedModulesIds.add(moduleId);
        }
      }
    }

    for (const moduleId of clientModules) {
      if (!usedModulesIds.has(moduleId)) clientModules.delete(moduleId);
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

      const include: string[] = [];

      if (isClientLikeEnvironment(environment))
        include.push(OPTIMIZED_CLIENT_MODULES);

      return {
        optimizeDeps: {
          include,
          esbuildOptions: {
            plugins: [getEsbuildPlugin(environment)],
          },
        },
      };
    },
    configureServer(server) {
      for (const environment of Object.values(server.environments)) {
        if (isScanUseClientModulesEnvironment(environment.name))
          scanUseClientModulesDevEnvironments.push(environment);
      }
    },
    async transform(code, id) {
      const moduleId = cleanId(id);

      if (!EXTENSIONS_REGEX.test(moduleId)) return;

      if (isScanUseServerModulesEnvironment(this.environment.name)) return;

      if (isClientLikeEnvironment(this.environment.name)) {
        const isEntry = clientModules.has(moduleId);
        // We can skip transformation of "use client" annotated modules that
        // are not used as entry points.
        if (!isEntry) return;
      }

      const isDev = this.environment.config.mode === "development";

      const program =
        couldBeUseClientModule(code) &&
        (await parse(code, moduleId, { jsxDev: isDev }));

      const isUseClientModule = program && getIsUseClientModule(program);

      if (isScanUseClientModulesEnvironment(this.environment.name)) {
        if (!isUseClientModule) {
          // Is possible that the module changed from client-only to
          // unspecified. In that case, we need to remove it.
          clientModules.delete(moduleId);
        } else {
          clientModules.add(moduleId);
        }
      }

      if (!isUseClientModule) return;

      const transformOptions = getTransformOptions({
        environment: this.environment.name,
        moduleId,
        minimizeIds: !isDev,
      });

      transform(program, transformOptions);

      return generate(program);
    },
    generateBundle(_, bundle) {
      if (isScanUseClientModulesEnvironment(this.environment.name))
        scanUseClientModulesBuildBundles.push(bundle);
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

export const CLIENT_MODULES = "/virtual:react-just/client-modules";
export const RESOLVED_CLIENT_MODULES = "\0" + CLIENT_MODULES;

function shouldApply(environment: string) {
  return Object.values(ENVIRONMENTS).includes(environment);
}

function getEsbuildPlugin(environment: string): EsbuildPlugin {
  return {
    name: PLUGIN_NAME,
    setup(build) {
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

          const program =
            couldBeUseClientModule(code) && (await parse(code, path));

          const isUseClientModule = program && getIsUseClientModule(program);

          if (!isUseClientModule) return;

          transform(program, transformOptions);

          return { contents: generate(program), loader: "js" };
        },
      );
    },
  };
}

const PLUGIN_NAME = "react-just:use-client";

const EXTENSIONS_REGEX = /\.(js|jsx|mjs|ts|tsx|mts)$/;

async function parse(code: string, id: string, options?: { jsxDev: boolean }) {
  const shouldTransform = /\.(jsx|ts|tsx|mts)$/.test(id);

  if (shouldTransform) {
    const { code: transformedCode } = await transformWithEsbuild(code, id, {
      jsx: "automatic",
      jsxImportSource: "react",
      jsxDev: options?.jsxDev,
    });

    return parseAstAsync(transformedCode);
  }

  return parseAstAsync(code);
}
