import { IncomingMessage } from "node:http";
import {
  JustRequest,
  JustResponse,
  PipeableStream,
  ReactClientValue,
  ReactFormState,
} from "./shared";

export function decodeAction<T>(body: FormData): Promise<() => T> | null;

export function decodeFormState<S>(
  actionResult: S,
  body: FormData,
): Promise<ReactFormState | null>;

export function decodePayloadIncomingMessage<T>(
  req: IncomingMessage,
): Promise<T>;

export function registerClientReference(
  moduleId: string | number,
  exportName: string | number,
): unknown;

export function registerServerReference<T extends Function>(
  reference: T,
  id: string,
): T;

export function renderToPipeableStream(value: ReactClientValue): PipeableStream;

export function runWithContext(context: Context, fn: () => void): Promise<void>;

export interface Context {
  req: JustRequest;
  res: JustResponse;
}
