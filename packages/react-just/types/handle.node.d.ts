import { IncomingMessage, ServerResponse } from "node:http";
import React, { ComponentType } from "react";
import { renderToPipeableStream as renderToPipeableHtmlStream } from "./fizz.node";
import {
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  renderToPipeableStream as renderToPipeableRscStream,
  runWithContext,
} from "./flight.node";

export interface HandleOptions {
  App: ComponentType;
  createTemporaryReferenceSet: typeof createTemporaryReferenceSet;
  decodeAction: typeof decodeAction;
  decodeFormState: typeof decodeFormState;
  decodeReply: typeof decodeReply;
  React: typeof React;
  renderToPipeableHtmlStream: typeof renderToPipeableHtmlStream;
  renderToPipeableRscStream: typeof renderToPipeableRscStream;
  runWithContext: typeof runWithContext;
}

export function createHandle(
  options: HandleOptions,
): (req: IncomingMessage, res: ServerResponse) => void;
