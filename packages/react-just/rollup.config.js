import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

export default defineConfig({
  input: {
    client: "src/client.ts",
    "fizz.node": "src/fizz/node.ts",
    "flight.node": "src/flight/node.ts",
    "handle.node": "src/handle/node.ts",
    vite: "src/vite/index.ts",
  },
  output: [
    {
      dir: "dist",
      format: "cjs",
      entryFileNames: "[name].cjs",
      chunkFileNames: "[name].cjs",
    },
    {
      dir: "dist",
      format: "esm",
      entryFileNames: "[name].mjs",
      chunkFileNames: "[name].mjs",
    },
  ],
  external: /node_modules/,
  plugins: [typescript({ tsconfig: "tsconfig.build.json" }), nodeResolve()],
});
