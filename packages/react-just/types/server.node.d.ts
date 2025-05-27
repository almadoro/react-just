import { IncomingMessage } from "node:http";
import { Writable } from "node:stream";
import { ReactNode } from "react";
import { Request } from "./server";

export function renderToFlightPipeableStream(model: ReactNode): PipeableStream;

export function renderToHtmlPipeableStream(model: ReactNode): PipeableStream;

export type PipeableStream = {
  abort(reason: unknown): void;
  pipe<T extends Writable>(destination: T): T;
};

export function incomingMessageToRequest(
  incomingMessage: IncomingMessage,
): Request;
