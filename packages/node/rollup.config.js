import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

export default defineConfig([
  {
    input: { bin: "src/bin.ts", vite: "src/vite.ts" },
    output: [
      {
        dir: "dist",
        format: "esm",
        entryFileNames: "[name].mjs",
        chunkFileNames: "[name].mjs",
      },
    ],
    external: (id) => /node_modules/.test(id) || id.startsWith("react-just"),
    plugins: [typescript({ tsconfig: "tsconfig.build.json" }), nodeResolve()],
  },
  {
    input: { vite: "src/vite.ts" },
    output: [
      {
        dir: "dist",
        format: "cjs",
        entryFileNames: "[name].cjs",
        chunkFileNames: "[name].cjs",
      },
    ],
    external: (id) => /node_modules/.test(id) || id.startsWith("react-just"),
    plugins: [typescript({ tsconfig: "tsconfig.build.json" }), nodeResolve()],
  },
]);
