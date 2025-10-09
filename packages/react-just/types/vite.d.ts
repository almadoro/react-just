import { PluginOption } from "vite";

export interface ReactJustOptions {
  app?: string;
}

export default function react(options?: ReactJustOptions): PluginOption;

export const ENVIRONMENTS: {
  CLIENT: string;
  FIZZ_NODE: string;
  FLIGHT_NODE: string;
};

export const ENTRIES: {
  CLIENT: string;
  FIZZ_NODE: string;
  FLIGHT_NODE: string;
};
