import { IncomingMessage } from "node:http";
import { PipeableStream, ReactClientValue } from "./shared";

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
