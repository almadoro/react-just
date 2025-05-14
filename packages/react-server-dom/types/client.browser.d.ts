import { Thenable } from "./shared";

export function createFromFetch<T>(
  promiseForResponse: Promise<Response>,
  options?: Options,
): Thenable<T>;

type Options = {
  callServer?: CallServerCallback;
  temporaryReferences?: TemporaryReferenceSet;
  findSourceMapURL?: FindSourceMapURLCallback;
  replayConsoleLogs?: boolean;
  environmentName?: string;
};

type CallServerCallback = unknown;
type TemporaryReferenceSet = unknown;
type FindSourceMapURLCallback = unknown;
