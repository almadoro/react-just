import { ClientReferenceManifestEntry } from "./shared";

type PipeableStream = {
  abort(reason: unknown): void;
  pipe<T extends NodeJS.WritableStream>(destination: T): T;
};

export function renderToPipeableStream(
  model: ReactClientValue,
  webpackMap: ClientManifest,
  options?: Options,
): PipeableStream;

// Serializable values
type ReactClientValue = any;

type ClientManifest = {
  [id: string]: ClientReferenceManifestEntry;
};

type Options = {
  environmentName?: string | (() => string);
  filterStackFrame?: (url: string, functionName: string) => boolean;
  onError?: (error: unknown) => void;
  onPostpone?: (reason: string) => void;
  identifierPrefix?: string;
  temporaryReferences?: TemporaryReferenceSet;
};

type TemporaryReferenceSet = WeakMap<TemporaryReference<any>, string>;

interface TemporaryReference<T> {}

export function registerClientReference<T>(
  proxyImplementation: React.Component,
  id: string,
  exportName: string,
): ClientReference<T>;

type ClientReference<T> = {
  $$typeof: symbol;
  $$id: string;
  $$async: boolean;
};
