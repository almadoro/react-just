import { ReactNode } from "react";

export function createFromRscFetch<T>(res: Promise<Response>): PromiseLike<T>;

export function hydrateFromWindowStream(): Promise<void>;

export function registerClientReference(
  implementation: unknown,
  moduleId: string | number,
  exportName: string | number,
): unknown;

export function render(tree: ReactNode): void;

export declare const RSC_MIME_TYPE: string;
