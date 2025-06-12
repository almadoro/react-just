import { Writable } from "node:stream";

export type PipeableStream = {
  abort(reason: unknown): void;
  pipe<T extends Writable>(destination: T): T;
};

export type Module = Record<string, unknown>;
