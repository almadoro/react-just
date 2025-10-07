declare module "react-server-dom-webpack/client.browser" {
  function createFromFetch<T>(
    promiseForResponse: Promise<Response>,
    options?: Options,
  ): Thenable<T>;

  function createFromReadableStream<T>(
    stream: ReadableStream,
    options?: Options,
  ): Thenable<T>;

  function createServerReference<TArgs extends Array<unknown>, TReturn>(
    id: string,
    callServer: CallServerCallback,
    encodeFormAction?: EncodeFormActionCallback,
    findSourceMapURL?: FindSourceMapURLCallback,
    functionName?: string,
  ): (...args: TArgs) => Promise<TReturn>;

  function createTemporaryReferenceSet(): TemporaryReferenceSet;

  function encodeReply(
    value: ReactServerValue,
    options?: {
      temporaryReferences?: TemporaryReferenceSet;
      signal?: AbortSignal;
    },
  ): Promise<string | URLSearchParams | FormData>;

  type Options = {
    callServer?: CallServerCallback;
    temporaryReferences?: TemporaryReferenceSet;
    findSourceMapURL?: FindSourceMapURLCallback;
    replayConsoleLogs?: boolean;
    environmentName?: string;
  };

  type CallServerCallback<TArgs = unknown[], TReturn = unknown> = (
    id: string,
    args: TArgs,
  ) => Promise<TReturn>;

  type TemporaryReferenceSet = Map<string, Reference | symbol>;

  type FindSourceMapURLCallback = unknown;

  interface Reference {}
}

declare module "react-server-dom-webpack/client.node" {
  import { Readable } from "node:stream";

  function createFromNodeStream<T>(
    stream: Readable,
    serverConsumerManifest: ServerConsumerManifest,
    options?: Options,
  ): Thenable<T>;

  type ServerConsumerManifest = {
    moduleMap: ServerConsumerModuleMap;
    moduleLoading: ModuleLoading;
    serverModuleMap: null | ServerManifest;
  };

  type ServerConsumerModuleMap = {
    [clientId: string]: {
      [clientExportName: string]: ClientReferenceManifestEntry;
    };
  };

  type ModuleLoading = null | {
    prefix: string;
    crossOrigin?: "use-credentials" | "";
  };

  type Options = {
    nonce?: string;
    encodeFormAction?: EncodeFormActionCallback;
    findSourceMapURL?: FindSourceMapURLCallback;
    replayConsoleLogs?: boolean;
    environmentName?: string;
  };

  function createServerReference<TArgs extends Array<unknown>, TReturn>(
    id: string,
    callServer: unknown,
  ): (...args: TArgs) => Promise<TReturn>;
}

declare module "react-server-dom-webpack/server.node" {
  import { Writable } from "node:stream";

  function decodeReply<T>(
    body: string | FormData,
    webpackMap: ServerManifest,
    options?: { temporaryReferences?: TemporaryReferenceSet },
  ): Thenable<T>;

  function decodeReplyFromBusboy<T>(
    busboyStream: import("busboy").Busboy,
    webpackMap: ServerManifest,
    options?: { temporaryReferences?: TemporaryReferenceSet },
  ): Thenable<T>;

  type PipeableStream = {
    abort(reason: unknown): void;
    pipe<T extends Writable>(destination: T): T;
  };

  function renderToPipeableStream(
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

  function registerClientReference<T>(
    proxyImplementation: unknown,
    id: string,
    exportName: string,
  ): ClientReference<T>;

  type ClientReference<T> = {
    $$typeof: symbol;
    $$id: string;
    $$async: boolean;
  };

  function registerServerReference<T extends Function>(
    reference: T,
    id: string,
    exportName: null | string,
  ): T;
}

type Thenable<T> =
  | UntrackedThenable<T>
  | PendingThenable<T>
  | FulfilledThenable<T>
  | RejectedThenable<T>;

interface ThenableImpl<T> extends PromiseLike<T> {}

interface UntrackedThenable<T> extends ThenableImpl<T> {
  status?: void;
  _debugInfo?: null | ReactDebugInfo;
}

interface PendingThenable<T> extends ThenableImpl<T> {
  status: "pending";
  _debugInfo?: null | ReactDebugInfo;
}

interface FulfilledThenable<T> extends ThenableImpl<T> {
  status: "fulfilled";
  value: T;
  _debugInfo?: null | ReactDebugInfo;
}

interface RejectedThenable<T> extends ThenableImpl<T> {
  status: "rejected";
  reason: unknown;
  _debugInfo?: null | ReactDebugInfo;
}

type ReactDebugInfo = unknown;

type ClientReferenceManifestEntry = ImportManifestEntry;

type ImportManifestEntry = {
  id: string;
  // chunks is a double indexed array of chunkId / chunkFilename pairs
  chunks: Array<string>;
  name: string;
  async?: boolean;
};

type EncodeFormActionCallback = (
  id: any,
  args: Promise<any>,
) => ReactCustomFormAction;

type ReactCustomFormAction = {
  name?: string;
  action?: string;
  encType?: string;
  method?: string;
  target?: string;
  data?: null | FormData;
};

type FindSourceMapURLCallback = (
  fileName: string,
  environmentName: string,
) => null | string;

// Serializable values
type ReactServerValue =
  // References are passed by their value
  | ServerReference<any>
  // The rest are passed as is. Sub-types can be passed in but lose their
  // subtype, so the receiver can only accept once of these.
  | string
  | boolean
  | number
  | null
  | void
  | bigint
  | AsyncIterable<ReactServerValue, ReactServerValue, void>
  | AsyncIterator<ReactServerValue, ReactServerValue, void>
  | Iterable<ReactServerValue>
  | Iterator<ReactServerValue>
  | Array<ReactServerValue>
  | Map<ReactServerValue, ReactServerValue>
  | Set<ReactServerValue>
  | FormData
  | Date
  | ReactServerObject
  | Promise<ReactServerValue>; // Thenable<ReactServerValue>

type ServerReference<T> = T;

type ReactServerObject = { [key: string]: ReactServerValue };

type ServerManifest = null;
