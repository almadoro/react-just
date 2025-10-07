import { IncomingMessage, ServerResponse } from "node:http";
import React, { ComponentType } from "react";
import { renderToPipeableStream as renderToPipeableHtmlStream } from "./fizz.node";
import {
  decodePayloadIncomingMessage,
  renderToPipeableStream as renderToPipeableRscStream,
} from "./flight.node";
import { AppProps } from "./index";

export interface HandleOptions {
  App: ComponentType<AppProps>;
  decodePayloadIncomingMessage: typeof decodePayloadIncomingMessage;
  React: typeof React;
  renderToPipeableHtmlStream: typeof renderToPipeableHtmlStream;
  renderToPipeableRscStream: typeof renderToPipeableRscStream;
}

export function createHandle(
  options: HandleOptions,
): (req: IncomingMessage, res: ServerResponse) => void;
