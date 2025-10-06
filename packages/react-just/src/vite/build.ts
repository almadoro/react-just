import { Plugin } from "vite";
import { APP_ENTRY } from "./entries";
import { ENVIRONMENTS } from "./environments";

export default function build(): Plugin {
  return {
    name: "react-just:build",
    apply: "build",
    async buildApp(builder) {
      await builder.build(
        builder.environments[ENVIRONMENTS.SCAN_USE_CLIENT_MODULES],
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
              rollupOptions: { input: APP_ENTRY },
              write: false,
            },
          },
        },
      };
    },
  };
}
