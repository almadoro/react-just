import { PipeableStream, ReactFormState } from "./shared";

export function registerClientReference(
  implementation: unknown,
  moduleId: string | number,
  exportName: string | number,
): unknown;

export function registerServerReference(id: string): unknown;

export function renderToPipeableStream(
  rscStream: PipeableStream,
  options: RenderToPipeableStreamOptions,
): PipeableStream;

export interface RenderToPipeableStreamOptions {
  formState?: ReactFormState | null;
}
