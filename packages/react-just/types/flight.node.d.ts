import { ReactNode } from "react";
import { PipeableStream } from "./shared";

export function registerClientReference(
  moduleId: string | number,
  exportName: string | number,
): unknown;

export function renderToPipeableStream(model: ReactNode): PipeableStream;
