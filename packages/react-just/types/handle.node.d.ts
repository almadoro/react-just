import { IncomingMessage, ServerResponse } from "node:http";
import React, { ComponentType } from "react";
import { renderToPipeableStream as renderToPipeableHtmlStream } from "./fizz.node";
import {
  decodeAction,
  decodeFormState,
  decodePayloadIncomingMessage,
  renderToPipeableStream as renderToPipeableRscStream,
  runWithContext,
} from "./flight.node";

export interface HandleOptions {
  App: ComponentType;
  decodeAction: typeof decodeAction;
  decodeFormState: typeof decodeFormState;
  decodePayloadIncomingMessage: typeof decodePayloadIncomingMessage;
  React: typeof React;
  renderToPipeableHtmlStream: typeof renderToPipeableHtmlStream;
  renderToPipeableRscStream: typeof renderToPipeableRscStream;
  runWithContext: typeof runWithContext;
}

export function createHandle(
  options: HandleOptions,
): (req: IncomingMessage, res: ServerResponse) => void;
