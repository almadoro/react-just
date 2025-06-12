import reactUseClient from "rollup-plugin-react-use-client";
import { Plugin, ResolvedConfig } from "vite";
import { getModuleRegisterId } from "./utils/client";
import ENVIRONMENTS from "./utils/environments";

export default function useClient(): Plugin {
  let config: ResolvedConfig;

  const moduleId = (id: string) => getModuleRegisterId(id, config);

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

  if (
    typeof flightTransform !== "function" ||
    typeof fizzTransform !== "function"
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
      if (this.environment.name === ENVIRONMENTS.FLIGHT)
        return flightTransform.apply(this, [code, idWithoutQuery]);
      if (this.environment.name === ENVIRONMENTS.FIZZ)
        return fizzTransform.apply(this, [code, idWithoutQuery]);
    },
  };
}
