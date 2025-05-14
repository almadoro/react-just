import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { defineConfig } from "rollup";

export default defineConfig({
  input: {
    "client.browser": "src/client.browser.js",
    "client.node": "src/client.node.js",
    "server.node": "src/server.node.js",
  },
  plugins: [commonjs(), nodeResolve({ exportConditions: ["react-server"] })],
  output: { dir: "dist", format: "esm" },
});
