import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "rollup-plugin-react-use-client": path.resolve(
        import.meta.dirname,
        "./src/index.ts",
      ),
    },
  },
});
