import { Writable } from "node:stream";
import { ReactNode } from "react";

export type PipeableStream = {
  abort(reason: unknown): void;
  pipe<T extends Writable>(destination: T): T;
};

export type RscPayload = {
  formState: ReactFormState | null;
  tree: ReactNode;
};

export type ReactFormState = [ReactClientValue, string, string, number];

// Serializable values
export type ReactClientValue =
  | ReactNode
  | string
  | boolean
  | number
  | symbol
  | null
  | void
  | bigint
  | ReadableStream
  | AsyncIterable<ReactClientValue, ReactClientValue, void>
  | AsyncIterator<ReactClientValue, ReactClientValue, void>
  | Iterable<ReactClientValue>
  | Iterator<ReactClientValue>
  | Array<ReactClientValue>
  | Map<ReactClientValue, ReactClientValue>
  | Set<ReactClientValue>
  | FormData
  | ArrayBufferView
  | ArrayBuffer
  | Date
  | ReactClientObject
  | Promise<ReactClientValue>; // Thenable<ReactClientValue>

type ReactClientObject = { [key: string]: ReactClientValue };
