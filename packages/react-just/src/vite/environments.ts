import {
  createServerHotChannel,
  createServerModuleRunner,
  DevEnvironment,
  Plugin,
  ResolvedConfig,
} from "vite";
import {
  ModuleEvaluator,
  ModuleRunner,
  ModuleRunnerContext,
} from "vite/module-runner";

export default function environments(): Plugin {
  return {
    name: "react-just:environments",
    config() {
      return {
        // noDiscovery: false is required to be able to trigger
        // reoptimizations and analyze specified entries.
        environments: {
          [ENVIRONMENTS.CLIENT]: {
            consumer: "client",
            optimizeDeps: {
              noDiscovery: false,
            },
          },
          [ENVIRONMENTS.FIZZ_NODE]: {
            consumer: "server",
            resolve: {
              noExternal: true,
            },
            optimizeDeps: {
              noDiscovery: false,
            },
          },
          [ENVIRONMENTS.FLIGHT_NODE]: {
            consumer: "server",
            resolve: {
              conditions: ["react-server"],
              noExternal: true,
            },
            optimizeDeps: {
              esbuildOptions: { conditions: ["react-server"] },
              noDiscovery: false,
            },
          },
          // On scan environments, no optimization is required since the code
          // won't be executed.
          [ENVIRONMENTS.SCAN_USE_CLIENT_MODULES]: {
            consumer: "server",
            resolve: {
              conditions: ["react-server"],
              // Since "use client" directive might appear in dependencies, we
              // can't treat them as external.
              noExternal: true,
            },
            optimizeDeps: {
              noDiscovery: true,
            },
            dev: {
              createEnvironment(name, config) {
                return new ScanEnvironment(name, config);
              },
            },
          },
          [ENVIRONMENTS.SCAN_USE_SERVER_MODULES]: {
            consumer: "server",
            resolve: {
              // Since the "use server" directive won't appear in dependencies,
              // we can treat them as external.
              external: true,
            },
            optimizeDeps: {
              noDiscovery: true,
            },
            dev: {
              createEnvironment(name, config) {
                return new ScanEnvironment(name, config);
              },
            },
          },
        },
      };
    },
  };
}

export const ENVIRONMENTS = {
  CLIENT: "client",
  FIZZ_NODE: "fizz_node",
  FLIGHT_NODE: "flight_node",
  SCAN_USE_CLIENT_MODULES: "scan_use_client_modules",
  SCAN_USE_SERVER_MODULES: "scan_use_server_modules",
};

/**
 * @returns Whether the environment is a client or fizz environment.
 */
export function isClientLikeEnvironment(environment: string) {
  return environment === ENVIRONMENTS.CLIENT || isFizzEnvironment(environment);
}

export function isFlightEnvironment(environment: string) {
  return environment === ENVIRONMENTS.FLIGHT_NODE;
}

export function isScanUseClientModulesEnvironment(environment: string) {
  return environment === ENVIRONMENTS.SCAN_USE_CLIENT_MODULES;
}

export function isScanUseServerModulesEnvironment(environment: string) {
  return environment === ENVIRONMENTS.SCAN_USE_SERVER_MODULES;
}

function isFizzEnvironment(environment: string) {
  return environment === ENVIRONMENTS.FIZZ_NODE;
}

// ScanEnvironment triggers `transform` hook in the same way as the
// RunnableDevEnvironment but it doesn't execute the code. To achieve that, we
// use a custom ModuleEvaluator that only triggers vite imports calls.
export class ScanEnvironment extends DevEnvironment {
  private runner: ModuleRunner;

  constructor(name: string, config: ResolvedConfig) {
    super(name, config, { hot: false, transport: createServerHotChannel() });

    this.runner = createServerModuleRunner(this, {
      hmr: false,
      evaluator: new ImportsEvaluator(),
    });
  }

  public async scan(id: string) {
    await this.runner.import(id);
  }
}

class ImportsEvaluator implements ModuleEvaluator {
  public async runExternalModule() {}

  public async runInlinedModule(
    { __vite_ssr_import__ }: ModuleRunnerContext,
    code: string,
  ) {
    const ids = new Set<string>();

    let match: RegExpExecArray | null;

    const importRegex = /__vite_ssr_import__\(\s*["'`]([^"'`]+)["'`][^)]*\)/g;
    while (true) {
      match = importRegex.exec(code);
      if (!match) break;
      ids.add(match[1]);
    }

    const dynamicImportRegex =
      /__vite_ssr_dynamic_import__\(\s*["'`]([^"'`]+)["'`][^)]*\)/g;
    while (true) {
      match = dynamicImportRegex.exec(code);
      if (!match) break;
      ids.add(match[1]);
    }

    await Promise.all(Array.from(ids).map((id) => __vite_ssr_import__(id)));
  }
}
