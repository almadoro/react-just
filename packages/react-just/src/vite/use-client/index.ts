import { generate } from "astring";
import type { Plugin as EsbuildPlugin } from "esbuild";
import { Expression } from "estree";
import fs from "fs/promises";
import { parseAstAsync, Plugin } from "vite";
import transform from "./transform";

export default function useClient(options: UseClientOptions) {
  function shouldApply(environmentName: string) {
    return environmentName in options.environments;
  }

  return {
    name: PLUGIN_NAME,
    applyToEnvironment(environment) {
      return shouldApply(environment.name);
    },
    configEnvironment(environmentName) {
      if (shouldApply(environmentName))
        return {
          optimizeDeps: {
            esbuildOptions: {
              plugins: [
                getEsbuildPlugin(options.environments[environmentName]),
              ],
            },
          },
        };
    },
    transform(code, id) {
      if (!EXTENSIONS_REGEX.test(id)) return;

      const program = this.parse(code);

      const { transformOptions, modules } =
        options.environments[this.environment.name];

      const { transformed } = transform(program, {
        ...transformOptions,
        getRegisterArguments: (ctx) =>
          transformOptions.getRegisterArguments({ ...ctx, moduleId: id }),
      });

      if (!transformed) return;

      modules.add(id);

      return generate(program);
    },
  } satisfies Plugin;
}

type UseClientOptions = {
  environments: Record<string, EnvironmentOptions>;
};

type EnvironmentOptions = {
  modules: Modules;
  transformOptions: TransformOptions;
};

export type TransformOptions = {
  getRegisterArguments: (context: {
    exportName: string;
    implementationIdentifier: string;
    moduleId: string;
  }) => Expression[];
  registerClientReferenceSource: string;
  treeshakeImplementation: boolean;
};

type Modules = Set<string>;

const PLUGIN_NAME = "react-just:use-client";

// Only exported for testing
export function getEsbuildPlugin(
  environment: EnvironmentOptions,
): EsbuildPlugin {
  return {
    name: PLUGIN_NAME,
    setup(build) {
      build.onLoad(
        { filter: EXTENSIONS_REGEX, namespace: "file" },
        async ({ path }) => {
          const code = await fs.readFile(path, "utf-8");

          const ast = await parseAstAsync(code);

          const { transformed } = transform(ast, {
            ...environment.transformOptions,
            getRegisterArguments: (ctx) =>
              environment.transformOptions.getRegisterArguments({
                ...ctx,
                moduleId: path,
              }),
          });

          if (!transformed) return;

          environment.modules.add(path);

          return { contents: generate(ast), loader: "js" };
        },
      );
    },
  };
}

// Vite will use query params like `?v=` sometimes.
const EXTENSIONS_REGEX = /\.(js|jsx|mjs|ts|tsx|mts)(\?[^\/]+)?$/;
