import { Root } from "react-dom/client";

export function hydrateFromWindowFlight(): Root;

export function createFromFlightFetch<T>(
  res: Promise<Response>,
): PromiseLike<T>;

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

export declare const WINDOW_SHARED: unique symbol;

declare global {
  interface Window {
    [WINDOW_SHARED]: {
      root: Root;
      rscMimeType: string;
    };
  }
}
