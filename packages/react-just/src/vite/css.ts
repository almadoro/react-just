import { DevEnvironment, Plugin } from "vite";
import { isFlightEnvironment } from "./environments";
import { isCssModule } from "./utils";

export default function css(): Plugin {
  const flightEnvironments: DevEnvironment[] = [];

  return {
    name: "react-just:css",
    configureServer(server) {
      for (const environment of Object.values(server.environments)) {
        if (isFlightEnvironment(environment.name))
          flightEnvironments.push(environment);
      }
    },
    resolveId(id) {
      if (id === CSS_MODULES) return RESOLVED_CSS_MODULES;
    },
    load(id) {
      if (id === RESOLVED_CSS_MODULES)
        return getCssModulesCode(flightEnvironments);
    },
  };
}

export const CSS_MODULES = "/virtual:react-just/css-modules";
export const RESOLVED_CSS_MODULES = "\0" + CSS_MODULES;

function getCssModulesCode(flightEnvironments: DevEnvironment[]) {
  const ids = new Set<string>();

  for (const environment of flightEnvironments) {
    const { idToModuleMap } = environment.moduleGraph;

    for (const [id, module] of idToModuleMap.entries()) {
      if (
        isCssModule(id) &&
        // On development, map may contain unused modules. Ignore them.
        module.importers.size !== 0
      )
        ids.add(id);
    }
  }

  return Array.from(ids)
    .map((id) => `import "${id}";`)
    .join("\n");
}
