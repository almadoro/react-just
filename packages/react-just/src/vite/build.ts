import { Plugin } from "vite";
import { SCAN_USE_CLIENT_ENTRY, SCAN_USE_SERVER_ENTRY } from "./entries";
import { ENVIRONMENTS } from "./environments";

export default function build(): Plugin {
  return {
    name: "react-just:build",
    apply: "build",
    async buildApp(builder) {
      // The use client scan must be executed first because the use server scan
      // depends on a dynamic module that changes with the use client scan.
      await builder.build(
        builder.environments[ENVIRONMENTS.SCAN_USE_CLIENT_MODULES],
      );
      await builder.build(
        builder.environments[ENVIRONMENTS.SCAN_USE_SERVER_MODULES],
      );
    },
    config() {
      return {
        appType: "custom",
        // React expects this variable to be replaced during build time.
        define: { "process.env.NODE_ENV": JSON.stringify("production") },
        environments: {
          [ENVIRONMENTS.SCAN_USE_CLIENT_MODULES]: {
            build: {
              rollupOptions: { input: SCAN_USE_CLIENT_ENTRY },
              write: false,
            },
          },
          [ENVIRONMENTS.SCAN_USE_SERVER_MODULES]: {
            build: {
              rollupOptions: { input: SCAN_USE_SERVER_ENTRY },
              write: false,
            },
          },
        },
      };
    },
  };
}
