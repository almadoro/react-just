import { Plugin } from "rollup";

export default function reactUseServer(): Plugin;

declare module "rollup" {
  interface CustomPluginOptions {
    reactUseServer: never;
  }
}
