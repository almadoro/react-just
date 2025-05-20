import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";

const EXTERNAL = (id) =>
  // TODO: should we remove this once we publish?
  /node_modules/.test(id) || id === "rollup-plugin-react-use-client";

export default defineConfig([
  {
    input: "src/vite/index.ts",
    output: [
      { file: "dist/vite.cjs", format: "cjs" },
      { file: "dist/vite.mjs", format: "esm" },
    ],
    external: EXTERNAL,
    plugins: [
      typescript({ tsconfig: "tsconfig.build.json" }),
      commonjs(),
      nodeResolve(),
    ],
  },
  {
    input: ".temp/vite/index.d.ts",
    output: [{ file: "dist/vite.d.ts", format: "esm" }],
    external: EXTERNAL,
    plugins: [dts({ tsconfig: "tsconfig.build.json", respectExternal: true })],
  },
  {
    input: "src/server/index.ts",
    output: [
      { file: "dist/server.cjs", format: "cjs" },
      { file: "dist/server.mjs", format: "esm" },
    ],
    external: EXTERNAL,
    plugins: [typescript({ tsconfig: "tsconfig.build.json" }), nodeResolve()],
  },
  {
    input: ".temp/server/index.d.ts",
    output: [{ file: "dist/server.d.ts", format: "esm" }],
    external: EXTERNAL,
    plugins: [dts({ tsconfig: "tsconfig.build.json", respectExternal: true })],
  },
  {
    input: "src/client/index.ts",
    output: [
      { file: "dist/client.cjs", format: "cjs" },
      { file: "dist/client.mjs", format: "esm" },
    ],
    external: EXTERNAL,
    plugins: [typescript({ tsconfig: "tsconfig.build.json" }), nodeResolve()],
  },
  {
    input: ".temp/client/index.d.ts",
    output: [{ file: "dist/client.d.ts", format: "esm" }],
    external: EXTERNAL,
    plugins: [dts({ tsconfig: "tsconfig.build.json", respectExternal: true })],
  },
]);
