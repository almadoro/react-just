import { Writable } from "node:stream";
import { ReactNode } from "react";

export function renderToFlightPipeableStream(model: ReactNode): PipeableStream;

export function renderToHtmlPipeableStream(model: ReactNode): PipeableStream;

export type PipeableStream = {
  abort(reason: unknown): void;
  pipe<T extends Writable>(destination: T): T;
};
