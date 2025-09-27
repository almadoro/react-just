import { Root } from "react-dom/client";
import { Module } from "./shared";

export declare const WINDOW_SHARED: unique symbol;

export function createFromRscFetch<T>(res: Promise<Response>): PromiseLike<T>;

export function hydrateFromWindowStream(): Root;

export function registerClientReference(
  implementation: unknown,
  moduleId: string | number,
  exportName: string | number,
): unknown;

declare global {
  interface Window {
    [WINDOW_SHARED]: {
      root: Root;
      rscMimeType: string;
    };
  }
}
