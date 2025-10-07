import { generate } from "astring";
import path from "node:path";
import { parseAstAsync, Plugin, transformWithEsbuild } from "vite";
import {
  ENVIRONMENTS,
  isFlightEnvironment,
  isScanUseClientModulesEnvironment,
  isScanUseServerModulesEnvironment,
} from "../environments";
import { cleanId } from "../utils";
import {
  couldContainUseServerDirective,
  getUseServerDirectiveScope,
} from "./directive";
import { getTransformOptions } from "./environments";
import transform from "./transform";

export default function useServer(): Plugin {
  const serverFunctionsModules = new Set<string>();

  return {
    name: "react-just:use-server",
    sharedDuringBuild: true,
    // We should apply this plugin before others because the "use server"
    // directive can appear at the top and other plugins may add code
    // before it (e.g. vitejs react plugin on development)
    enforce: "pre",
    applyToEnvironment(environment) {
      return shouldApply(environment.name);
    },
    async transform(code, id) {
      if (isScanUseClientModulesEnvironment(this.environment.name)) return;

      const moduleId = cleanId(id);

      if (!EXTENSIONS_REGEX.test(moduleId)) return;

      const isDev = this.environment.config.mode === "development";

      const root = this.environment.config.root;

      const program =
        couldContainUseServerDirective(code) &&
        (await parse(code, moduleId, { jsxDev: isDev }));

      const useServerDirectiveScope =
        program && getUseServerDirectiveScope(program);

      if (isScanUseServerModulesEnvironment(this.environment.name)) {
        if (useServerDirectiveScope === "module") {
          serverFunctionsModules.add(moduleId);
        }
        // Is possible that the module changed from server-only to
        // unspecified or is now using function scoped directive.
        // In that case, we need to remove it.
        else {
          serverFunctionsModules.delete(moduleId);
        }
      }

      if (!useServerDirectiveScope) return;

      // We can ignore transformation of "use server" annotated modules that
      // are not used as entry points.
      if (
        useServerDirectiveScope === "module" &&
        isFlightEnvironment(this.environment.name)
      ) {
        const isEntry = serverFunctionsModules.has(moduleId);
        if (!isEntry) return;
      }

      if (moduleId.includes("node_modules/"))
        throw new Error(
          `"use server" directive cannot be used in package dependencies. Found in "${moduleId}"`,
        );

      transform(
        program,
        getTransformOptions({
          environment: this.environment.name,
          hash: !isDev,
          relativePath: path.relative(root, moduleId),
        }),
      );

      return generate(program);
    },
    resolveId(id) {
      if (id === SERVER_FUNCTIONS_MODULES)
        return RESOLVED_SERVER_FUNCTIONS_MODULES;
    },
    load(id) {
      if (id === RESOLVED_SERVER_FUNCTIONS_MODULES) {
        let code = "";

        for (const id of serverFunctionsModules) {
          code += `import "${id}";`;
        }

        return code;
      }
    },
  } satisfies Plugin;
}

export const SERVER_FUNCTIONS_MODULES =
  "/virtual:react-just/server-functions-modules";
export const RESOLVED_SERVER_FUNCTIONS_MODULES =
  "\0" + SERVER_FUNCTIONS_MODULES;

function shouldApply(environment: string) {
  return Object.values(ENVIRONMENTS).includes(environment);
}

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
