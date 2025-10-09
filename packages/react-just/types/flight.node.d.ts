import { IncomingMessage } from "node:http";
import {
  JustRequest,
  JustResponse,
  PipeableStream,
  ReactClientValue,
  ReactFormState,
} from "./shared";

export function createTemporaryReferenceSet(): TemporaryReferenceSet;

export function decodeAction<T>(body: FormData): Promise<() => T> | null;

export function decodeFormState<S>(
  actionResult: S,
  body: FormData,
): Promise<ReactFormState | null>;

export function decodeReply<T>(
  req: IncomingMessage,
  options: DecodeReplyOptions,
): Promise<T>;

export function registerClientReference(
  moduleId: string | number,
  exportName: string | number,
): unknown;

export function registerServerReference<T extends Function>(
  reference: T,
  id: string,
): T;

export function renderToPipeableStream(
  value: ReactClientValue,
  options: RenderToPipeableStreamOptions,
): PipeableStream;

export function runWithContext(context: Context, fn: () => void): Promise<void>;

export interface Context {
  req: JustRequest;
  res: JustResponse;
}

export interface DecodeReplyOptions {
  temporaryReferences: TemporaryReferenceSet;
}

export interface RenderToPipeableStreamOptions {
  temporaryReferences: TemporaryReferenceSet;
}

export type TemporaryReferenceSet = WeakMap<TemporaryReference, string>;

interface TemporaryReference {}
