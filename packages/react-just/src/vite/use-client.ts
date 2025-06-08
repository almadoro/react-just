import reactUseClient from "rollup-plugin-react-use-client";
import type { Plugin, ResolvedConfig } from "vite";
import { getModuleRegisterId } from "./utils/client";

export default function useClient(): Plugin {
  let config: ResolvedConfig;

  const { transform, ...plugin } = reactUseClient({
    registerClientReference: {
      import: "registerClientReference",
      from: "react-just/server",
    },
    moduleId: (id) => getModuleRegisterId(id, config),
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
