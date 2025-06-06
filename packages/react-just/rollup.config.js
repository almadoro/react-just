import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

export default defineConfig([
  {
    input: {
      client: "src/client/index.ts",
      server: "src/server/index.ts",
      "server.node": "src/server/node/index.ts",
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
    external: (id) =>
      /node_modules/.test(id) || id === "rollup-plugin-react-use-client",
    plugins: [typescript({ tsconfig: "tsconfig.build.json" }), nodeResolve()],
  },
]);
