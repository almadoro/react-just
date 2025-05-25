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
      { dir: "dist/esm", format: "esm" },
      { dir: "dist/cjs", format: "cjs" },
    ],
    external: (id) =>
      /node_modules/.test(id) || id === "rollup-plugin-react-use-client",
    plugins: [typescript({ tsconfig: "tsconfig.build.json" }), nodeResolve()],
  },
]);
