import { PluginOption } from "vite";

export type ReactJustOptions = {
  /**
   * Specify the app entry file (relative to project root)
   *
   * @default `src/index.(tsx|jsx|ts|js)`
   */
  app?: string;
};

export default function react(options?: ReactJustOptions): PluginOption;
