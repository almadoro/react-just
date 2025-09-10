import { DevEnvironment, Plugin } from "vite";
import { isClientLikeEnvironment, isFlightEnvironment } from "./environments";
import { invalidateModules } from "./utils";

export default function css(): Plugin {
  const flightDevEnvironments: DevEnvironment[] = [];
  const clientLikeDevEnvironments: DevEnvironment[] = [];
  const cssModuleIds = new Set<string>();

  function removeUnusedModules() {
    const pruneUrls = new Set<string>();
    const pruneIds = new Set<string>();

    for (const flightEnv of flightDevEnvironments) {
      for (const [
        moduleId,
        flightModule,
      ] of flightEnv.moduleGraph.idToModuleMap.entries()) {
        if (!isCssModule(moduleId)) continue;

        const moduleUrl = flightModule.url;
        if (!moduleUrl) continue;

        const isFlightUnused = flightModule.importers.size === 0;

        const isUnused = isFlightUnused && isClientUnused(moduleId);

        if (isUnused) {
          pruneUrls.add(moduleUrl);
          pruneIds.add(moduleId);
          cssModuleIds.delete(moduleId);
          // Invalidating on the environment forces a transform, thus adding the
          // module back to the css module ids, in case it's referenced again.
          flightEnv.moduleGraph.invalidateModule(flightModule);
        }
      }
    }

    for (const environment of clientLikeDevEnvironments) {
      environment.hot.send({ type: "prune", paths: Array.from(pruneUrls) });
      // Invalidating on client environments forces browsers to re-import
      // pruned modules when they are referenced again.
      invalidateModules(environment, ...pruneIds);
    }
  }

  function isClientUnused(moduleId: string) {
    for (const clientEnv of clientLikeDevEnvironments) {
      const clientModule = clientEnv.moduleGraph.getModuleById(moduleId);
      if (!clientModule) continue;

      for (const importer of clientModule.importers) {
        if (importer.id !== RESOLVED_CSS_MODULES) {
          return false;
        }
      }
    }

    return true;
  }

  return {
    name: "react-just:css",
    configureServer(server) {
      for (const environment of Object.values(server.environments)) {
        if (isFlightEnvironment(environment.name))
          flightDevEnvironments.push(environment);
        else if (isClientLikeEnvironment(environment.name))
          clientLikeDevEnvironments.push(environment);
      }
    },
    resolveId(id) {
      if (id === CSS_MODULES) return RESOLVED_CSS_MODULES;
    },
    load(id) {
      if (isFlightEnvironment(this.environment.name) && isCssModule(id))
        cssModuleIds.add(id);

      if (id === RESOLVED_CSS_MODULES) {
        removeUnusedModules();
        return getCssModulesCode(cssModuleIds);
      }
    },
  };
}

export const CSS_MODULES = "/virtual:react-just/css-modules";
export const RESOLVED_CSS_MODULES = "\0" + CSS_MODULES;

function getCssModulesCode(ids: Iterable<string>) {
  return Array.from(ids)
    .map((id) => `import "${id}";`)
    .join("\n");
}

function isCssModule(id: string) {
  return CSS_EXTENSIONS_RE.test(id);
}

// Taken from: https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts#L92
const CSS_EXTENSIONS_RE =
  /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)($|\?)/;
