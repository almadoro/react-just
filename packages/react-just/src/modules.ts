globalThis.__RJ_MODULES__ ||= {};

export function registerModuleExport(
  implementation: unknown,
  moduleId: string | number,
  exportName: string | number,
) {
  globalThis.__RJ_MODULES__[moduleId] ||= {};
  globalThis.__RJ_MODULES__[moduleId][exportName] = implementation;
}

globalThis.__webpack_require__ = (id) => {
  const [moduleId] = id.split("#");
  const module = globalThis.__RJ_MODULES__[moduleId];
  if (!module) throw new Error(`Module ${moduleId} not found`);
  return module;
};

// We don't expect it to be used.
globalThis.__webpack_chunk_load__ = (id) => {
  throw new Error(
    "__webpack_chunk_load__ is not supported. Trying to load module: " + id,
  );
};

type Module = Record<string, unknown>;

declare global {
  var __RJ_MODULES__: Record<string, Module>;

  // react-server-dom-webpack expects __webpack_require__ and
  // __webpack_chunk_load__ to be available.

  function __webpack_require__(id: string): Module;

  function __webpack_chunk_load__(id: string): Promise<Module>;
}
