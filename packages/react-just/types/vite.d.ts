import React from "react";
import { PluginOption } from "vite";
import { renderToPipeableStream as renderToPipeableHtmlStream } from "./fizz.node";
import { renderToPipeableStream as renderToPipeableRscStream } from "./flight.node";
import { AppProps } from "./index";

export type ReactJustOptions = {
  /**
   * Specify the app entry file (relative to project root)
   *
   * @default `src/index.(tsx|jsx|ts|js)`
   */
  app?: string;
};

export default function react(options?: ReactJustOptions): PluginOption;

export const RSC_MIME_TYPE: string;

export const ENVIRONMENTS: {
  CLIENT: string;
  FIZZ_NODE: string;
  FLIGHT_NODE: string;
};

export const ENTRIES: {
  CLIENT: string;
  FIZZ_NODE: string;
  FLIGHT_NODE: string;
};

export interface FlightEntryNodeModule {
  App: React.ComponentType<AppProps>;
  renderToPipeableStream: typeof renderToPipeableRscStream;
  React: typeof React;
}

export interface FizzEntryNodeModule {
  renderToPipeableStream: typeof renderToPipeableHtmlStream;
}
