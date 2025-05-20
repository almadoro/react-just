import { Writable } from "node:stream";
import { ReactNode } from "react";

export function registerClientReference(
  proxyImplementation: unknown,
  id: string,
  exportName: string,
): void;

export function renderToFlightPipeableStream(model: ReactNode): PipeableStream;

export function renderToHtmlPipeableStream(model: ReactNode): PipeableStream;

export type PipeableStream = {
  abort(reason: unknown): void;
  pipe<T extends Writable>(destination: T): T;
};
