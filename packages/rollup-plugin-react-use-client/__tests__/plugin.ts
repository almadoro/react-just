import type { TransformPluginContext } from "rollup";
import reactUseClient from "rollup-plugin-react-use-client";
import { parseAst } from "rollup/parseAst";

const plugin = reactUseClient({
  moduleId: (_, id) => id,
  registerClientReference: { import: "registerClientReference", from: "react" },
});

export const transform = plugin.transform.bind({
  // Only the parse method is used by the plugin
  parse: parseAst,
} as TransformPluginContext);

export const moduleParsed = plugin.moduleParsed;
