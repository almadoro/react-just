import reactUseClient from "rollup-plugin-react-use-client";
import type { Plugin, ResolvedConfig } from "vite";
import { getRegisterModuleIdFromPath } from "./utils/client";

export default function useClient(): Plugin {
  let config: ResolvedConfig;

  const { transform, ...plugin } = reactUseClient({
    registerClientReference: {
      import: "registerClientReference",
      from: "react-just/server",
    },
    async moduleId(id) {
      // In development use the original id since it will be used to load the
      // module from the client.
      if (config.mode === "development") return id;

      return getRegisterModuleIdFromPath(id);
    },
  });

  if (typeof transform !== "function")
    throw new Error(
      "Expected rollup-plugin-react-use-client transform to be a function",
    );

  return {
    ...plugin,
    name: "react-just:use-client",
    configResolved(c) {
      config = c;
    },
    transform(code, id, config) {
      if (!config?.ssr) return;

      return transform.bind(this)(code, id);
    },
  };
}
