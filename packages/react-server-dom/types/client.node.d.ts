import { Readable } from "node:stream";
import { ClientReferenceManifestEntry, Thenable } from "./shared";

export function createFromNodeStream<T>(
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
