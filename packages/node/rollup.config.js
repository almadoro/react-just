import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

const EXTERNAL = (id) =>
  // TODO: should we remove this once we publish?
  /node_modules/.test(id) || id.startsWith("react-just");

export default defineConfig([
  {
    input: "src/bin.ts",
    output: [{ file: "dist/bin", format: "esm" }],
    external: EXTERNAL,
    plugins: [typescript({ tsconfig: "tsconfig.build.json" }), nodeResolve()],
  },
]);
