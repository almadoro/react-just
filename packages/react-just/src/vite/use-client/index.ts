import { generate } from "astring";
import type { Plugin as EsbuildPlugin } from "esbuild";
import { Expression } from "estree";
import fs from "fs/promises";
import { parseAstAsync, Plugin, transformWithEsbuild } from "vite";
import transform from "./transform";

export default function useClient(options: UseClientOptions) {
  function shouldApply(environmentName: string) {
    return environmentName in options.environments;
  }

  return {
    name: PLUGIN_NAME,
    // We should apply this plugin before others because the "use client"
    // directive must appear at the top and other plugins may add code
    // before it (e.g. vitejs react plugin on development)
    enforce: "pre",
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
    async transform(code, id) {
      if (!EXTENSIONS_REGEX.test(id)) return;

      const program = await parse(code, id, this.environment.mode === "dev");

      const { transformOptions, onModuleTransformed } =
        options.environments[this.environment.name];

      const { transformed } = transform(program, {
        ...transformOptions,
        getRegisterArguments: (ctx) =>
          transformOptions.getRegisterArguments({
            ...ctx,
            moduleId: id,
          }),
      });

      if (!transformed) return;

      onModuleTransformed?.(id);

      return generate(program);
    },
  } satisfies Plugin;
}

type UseClientOptions = {
  environments: Record<string, EnvironmentOptions>;
};

type EnvironmentOptions = {
  onModuleTransformed?: (id: string) => void;
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

          const ast = await parse(code, path, false);

          const { transformed } = transform(ast, {
            ...environment.transformOptions,
            getRegisterArguments: (ctx) =>
              environment.transformOptions.getRegisterArguments({
                ...ctx,
                moduleId: path,
              }),
          });

          if (!transformed) return;

          environment.onModuleTransformed?.(path);

          return { contents: generate(ast), loader: "js" };
        },
      );
    },
  };
}

// Vite will use query params like `?v=` sometimes.
const EXTENSIONS_REGEX = /\.(js|jsx|mjs|ts|tsx|mts)(\?[^\/]+)?$/;

async function parse(code: string, id: string, isDev: boolean) {
  const shouldTransform = /\.(jsx|ts|tsx|mts)/.test(id);

  if (shouldTransform) {
    const { code: transformedCode } = await transformWithEsbuild(code, id, {
      jsx: "automatic",
      jsxImportSource: "react",
      jsxDev: isDev,
    });

    return parseAstAsync(transformedCode);
  }

  return parseAstAsync(code);
}
