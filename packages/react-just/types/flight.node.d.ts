import React from "react";
import { PipeableStream } from "./shared";

export function registerClientReference(
  moduleId: string,
  exportName: string,
): void;

export function renderToPipeableStream(model: React.ReactNode): PipeableStream;
