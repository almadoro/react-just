globalThis.__RJ_IMPL__ ||= {};

export const IMPLEMENTATION_EXPORT_NAME = "default";

export function getImplementation(id: string) {
  return globalThis.__RJ_IMPL__[id]?.[IMPLEMENTATION_EXPORT_NAME] ?? null;
}

export function registerImplementation(implementation: unknown, id: string) {
  globalThis.__RJ_IMPL__[id] = { [IMPLEMENTATION_EXPORT_NAME]: implementation };
}

globalThis.__webpack_require__ = (id) => {
  const impl = globalThis.__RJ_IMPL__[id];
  if (!impl) throw new Error(`Implementation for ${id} not found`);
  return impl;
};

// We don't expect it to be used.
globalThis.__webpack_chunk_load__ = (id) => {
  throw new Error(
    "__webpack_chunk_load__ is not supported. Trying to load implementation: " +
      id,
  );
};

declare global {
  var __RJ_IMPL__: Record<string, { [IMPLEMENTATION_EXPORT_NAME]: unknown }>;

  // react-server-dom-webpack expects __webpack_require__ and
  // __webpack_chunk_load__ to be available.

  function __webpack_require__(id: string): unknown;

  function __webpack_chunk_load__(id: string): never;
}
