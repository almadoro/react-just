import type { TransformPluginContext } from "rollup";
import reactUseClient from "rollup-plugin-react-use-client";
import { parseAst } from "rollup/parseAst";

const plugin = reactUseClient({
  moduleId: (id) => id,
  registerClientReference: { import: "registerClientReference", from: "react" },
});

export async function transform(code: string, id: string) {
  if (typeof plugin.transform !== "function") {
    throw new Error("plugin transform is not a function");
  }

  const output = await plugin.transform.bind({
    // Only the parse method is used by the plugin
    parse: parseAst,
  } as TransformPluginContext)(code, id);

  if (typeof output === "string") return { code: output };

  return output;
}

if (typeof plugin.moduleParsed !== "function") {
  throw new Error("plugin moduleParsed is not a function");
}

export const moduleParsed = plugin.moduleParsed;
