import { VercelRequest, VercelResponse } from "@vercel/node";
import React from "react";
import { AppEntryProps } from "react-just";
import { renderToPipeableStream as renderToPipeableHtmlStream } from "react-just/fizz.node";
import { renderToPipeableStream as renderToPipeableRscStream } from "react-just/flight.node";

export interface HandleOptions {
  App: React.ComponentType<AppEntryProps>;
  React: typeof React;
  renderToPipeableHtmlStream: typeof renderToPipeableHtmlStream;
  renderToPipeableRscStream: typeof renderToPipeableRscStream;
  resources: {
    css: string[];
    js: string[];
  };
  rscMimeType: string;
}

export function createHandle(options: HandleOptions): HandleFunction;

export type HandleFunction = (req: VercelRequest, res: VercelResponse) => void;
