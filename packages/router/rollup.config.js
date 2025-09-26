import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

export default defineConfig([
  {
    input: "src/index.ts",
    external: (id) => /node_modules/.test(id) || id.startsWith("react-just"),
    output: {
      preserveModules: true,
      preserveModulesRoot: "src",
      dir: "dist",
      format: "esm",
      entryFileNames: "[name].mjs",
      chunkFileNames: "[name]-[hash].mjs",
    },
    plugins: [
      typescript({ tsconfig: "tsconfig.build.json" }),
      nodeResolve(),
      {
        name: "preserve-use-client",
        transform(code) {
          if (/^("use client"|'use client');?$/m.test(code))
            return { meta: { hasUseClient: true } };
        },
        renderChunk(code, chunk) {
          for (const id of chunk.moduleIds) {
            const { meta } = this.getModuleInfo(id);
            if (meta.hasUseClient) return `"use client";\n${code}`;
          }
        },
      },
    ],
  },
  {
    input: "src/cjs.ts",
    output: { file: "dist/index.cjs", format: "cjs" },
  },
]);
