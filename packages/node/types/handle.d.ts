import { IncomingMessage, ServerResponse } from "node:http";
import React, { ComponentType } from "react";
import { AppProps } from "react-just";
import { renderToPipeableStream as renderToPipeableHtmlStream } from "react-just/fizz.node";
import {
  decodePayloadIncomingMessage,
  renderToPipeableStream as renderToPipeableRscStream,
} from "react-just/flight.node";

export interface HandleOptions {
  App: ComponentType<AppProps>;
  decodePayloadIncomingMessage: typeof decodePayloadIncomingMessage;
  React: typeof React;
  renderToPipeableHtmlStream: typeof renderToPipeableHtmlStream;
  renderToPipeableRscStream: typeof renderToPipeableRscStream;
  resources: {
    css: string[];
    js: string[];
  };
}

export function createHandle(options: HandleOptions): HandleFunction;

export type HandleFunction = (
  req: IncomingMessage,
  res: ServerResponse,
) => void;
