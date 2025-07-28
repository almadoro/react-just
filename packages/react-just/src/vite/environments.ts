import { Plugin } from "vite";

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
        },
      };
    },
  };
}

export const ENVIRONMENTS = {
  CLIENT: "client",
  FIZZ_NODE: "fizz_node",
  FLIGHT_NODE: "flight_node",
};

/**
 * @returns Whether the environment is a client or fizz environment.
 */
export function isClientLikeEnvironment(environment: string) {
  return isClientEnvironment(environment) || isFizzEnvironment(environment);
}

export function isFlightEnvironment(environment: string) {
  return environment === ENVIRONMENTS.FLIGHT_NODE;
}

function isFizzEnvironment(environment: string) {
  return environment === ENVIRONMENTS.FIZZ_NODE;
}

function isClientEnvironment(environment: string) {
  return environment === ENVIRONMENTS.CLIENT;
}
