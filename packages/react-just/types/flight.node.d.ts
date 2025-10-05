import { ReactNode } from "react";
import { PipeableStream } from "./shared";

export function registerClientReference(
  moduleId: string | number,
  exportName: string | number,
): unknown;

export function registerServerReference<T extends Function>(
  reference: T,
  id: string,
  exportName: null | string,
): T;

export function renderToPipeableStream(model: ReactNode): PipeableStream;
