import { Plugin } from "vite";

export default function build(): Plugin {
  return {
    name: "react-just:build",
    apply: "build",
    config() {
      return {
        appType: "custom",
        // React expects this variable to be replaced during build time.
        define: { "process.env.NODE_ENV": JSON.stringify("production") },
      };
    },
  };
}
