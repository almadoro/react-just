import reactUseClient from "rollup-plugin-react-use-client";
import { Plugin, ResolvedConfig } from "vite";

export default function useClient(): Plugin {
  let config: ResolvedConfig;

  const { transform, ...plugin } = reactUseClient({
    registerClientReference: {
      import: "registerClientReference",
      from: "react-just/server",
    },
    moduleId: (_, id) => {
      if (config.mode === "development") return id;
      // TODO: handle this properly
      return id;
    },
  });

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
