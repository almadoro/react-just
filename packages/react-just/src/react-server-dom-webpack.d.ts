declare module "react-server-dom-webpack/client.browser" {
  function createFromFetch<T>(
    promiseForResponse: Promise<Response>,
    options?: Options,
  ): Thenable<T>;

  function createFromReadableStream<T>(
    stream: ReadableStream,
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

  type ServerManifest = void;

  type Options = {
    nonce?: string;
    encodeFormAction?: EncodeFormActionCallback;
    findSourceMapURL?: FindSourceMapURLCallback;
    replayConsoleLogs?: boolean;
    environmentName?: string;
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
}

declare module "react-server-dom-webpack/server.node" {
  import { Writable } from "node:stream";

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
