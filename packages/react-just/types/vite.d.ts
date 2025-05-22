import { PluginOption } from "vite";

export type ReactJustOptions = {
  /**
   * Specify the app entry file (relative to project root)
   */
  app: string;
};

export default function reactJust(options: ReactJustOptions): PluginOption;
