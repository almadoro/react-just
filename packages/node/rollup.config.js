import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

const EXTERNAL = (id) =>
  // TODO: should we remove this once we publish?
  /node_modules/.test(id) || id.startsWith("react-just");

export default defineConfig([
  {
    input: { bin: "src/bin.ts" },
    output: [{ dir: "dist", format: "esm" }],
    external: EXTERNAL,
    plugins: [typescript({ tsconfig: "tsconfig.build.json" }), nodeResolve()],
  },
]);
