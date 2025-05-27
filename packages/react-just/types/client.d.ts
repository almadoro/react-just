export function hydrateFromWindowFlight(): void;

export function registerModule(id: string, module: Module): void;

type Module = Record<string, unknown>;

export {
  /**
   * @deprecated Use the exported type from `react-just/server` instead.
   */
  AppEntryProps,
  /**
   * @deprecated Use the exported type from `react-just/server` instead.
   */
  Request,
} from "./server";
