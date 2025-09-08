import { Root } from "react-dom/client";
import { Module } from "./shared";

export declare const WINDOW_SHARED: unique symbol;

export function createFromRscFetch<T>(res: Promise<Response>): PromiseLike<T>;

export function hydrateFromWindowStream(): Root;

export function registerClientReference(
  module: Module,
  moduleId: string | number,
  exportName: string | number,
): void;

declare global {
  interface Window {
    [WINDOW_SHARED]: {
      root: Root;
      rscMimeType: string;
    };
  }
}
