import { VercelRequest, VercelResponse } from "@vercel/node";
import React, { ComponentType } from "react";
import { renderToPipeableStream as renderToPipeableHtmlStream } from "react-just/fizz.node";
import {
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  renderToPipeableStream as renderToPipeableRscStream,
  runWithContext,
} from "react-just/flight.node";

export interface HandleOptions {
  App: ComponentType;
  createTemporaryReferenceSet: typeof createTemporaryReferenceSet;
  decodeAction: typeof decodeAction;
  decodeFormState: typeof decodeFormState;
  decodeReply: typeof decodeReply;
  React: typeof React;
  renderToPipeableHtmlStream: typeof renderToPipeableHtmlStream;
  renderToPipeableRscStream: typeof renderToPipeableRscStream;
  resources: {
    css: string[];
    js: string[];
  };
  runWithContext: typeof runWithContext;
}

export function createHandle(options: HandleOptions): HandleFunction;

export type HandleFunction = (req: VercelRequest, res: VercelResponse) => void;
