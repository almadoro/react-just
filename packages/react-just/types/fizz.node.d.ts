import { Module, PipeableStream } from "./shared";

export function registerClientReference(
  module: Module,
  moduleId: string,
  exportName: string,
): void;

export function renderToPipeableStream(
  rscStream: PipeableStream,
): PipeableStream;
