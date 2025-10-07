import { IncomingMessage } from "node:http";
import { ReactNode } from "react";
import { PipeableStream } from "./shared";

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
  exportName: null | string,
): T;

export function renderToPipeableStream(model: ReactNode): PipeableStream;
