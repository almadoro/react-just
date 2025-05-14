export type Thenable<T> =
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

export type ClientReferenceManifestEntry = ImportManifestEntry;

type ImportManifestEntry = {
  id: string;
  // chunks is a double indexed array of chunkId / chunkFilename pairs
  chunks: Array<string>;
  name: string;
  async?: boolean;
};
