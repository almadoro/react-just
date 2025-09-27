import { PipeableStream } from "./shared";

export function registerClientReference(
  implementation: unknown,
  moduleId: string | number,
  exportName: string | number,
): unknown;

export function renderToPipeableStream(
  rscStream: PipeableStream,
): PipeableStream;
