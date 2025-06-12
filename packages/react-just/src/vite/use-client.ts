import { createHash } from "node:crypto";
import path from "node:path";
import reactUseClient from "rollup-plugin-react-use-client";
import { Plugin, ResolvedConfig } from "vite";
import ENVIRONMENTS from "./utils/environments";

export default function useClient(): Plugin {
  let config: ResolvedConfig;

  function moduleId(id: string) {
    if (config.mode === "development") return id;
    // Use a hash of the relative path to the project root as the module id.
    // This ensures that the module id is consistent across builds.
    const relativePath = path.relative(config.root, id);
    const hash = createHash("sha256").update(relativePath).digest("base64url");
    return hash;
  }

  const { transform: flightTransform, ...basePlugin } = reactUseClient({
    moduleId,
    registerClientReference: {
      import: "registerClientReference",
      from: "react-just/flight.node",
    },
    // Ignore the implementation argument so we can treeshake the
    // implementation.
    registerArguments: ["module-id", "export-name"],
    treeshakeImplementation: true,
  });

  const { transform: fizzTransform } = reactUseClient({
    moduleId,
    registerClientReference: {
      import: "registerClientReference",
      from: "react-just/fizz.node",
    },
    registerArguments: ["implementation", "module-id", "export-name"],
  });

  const { transform: clientTransform } = reactUseClient({
    moduleId,
    registerClientReference: {
      import: "registerClientReference",
      from: "react-just/client",
    },
    registerArguments: ["implementation", "module-id", "export-name"],
  });

  if (
    typeof flightTransform !== "function" ||
    typeof fizzTransform !== "function" ||
    typeof clientTransform !== "function"
  )
    throw new Error(
      "Expected rollup-plugin-react-use-client transform to be a function",
    );

  return {
    ...basePlugin,
    name: "react-just:use-client",
    configResolved(c) {
      config = c;
    },
    transform(code, id) {
      // Vite will use `?v=` and `?t=` sometimes.
      const [, idWithoutQuery] = id.match(/^([^?]*)/)!;
      if (this.environment.name === ENVIRONMENTS.CLIENT)
        return clientTransform.apply(this, [code, idWithoutQuery]);
      if (this.environment.name === ENVIRONMENTS.FIZZ)
        return fizzTransform.apply(this, [code, idWithoutQuery]);
      if (this.environment.name === ENVIRONMENTS.FLIGHT)
        return flightTransform.apply(this, [code, idWithoutQuery]);
    },
  };
}
