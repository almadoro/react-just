import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

export default defineConfig([
  {
    input: { bin: "src/bin.ts" },
    output: [{ dir: "dist", format: "esm" }],
    external: (id) => /node_modules/.test(id) || id.startsWith("react-just"),
    plugins: [typescript({ tsconfig: "tsconfig.build.json" }), nodeResolve()],
  },
]);
