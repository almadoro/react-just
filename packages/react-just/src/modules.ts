const MODULES: Record<string, Module> = {};

export function registerModule(moduleId: string, module: Module) {
  MODULES[moduleId] = module;
}

export function registerModuleExport(
  implementation: unknown,
  moduleId: string,
  exportName: string,
) {
  MODULES[moduleId] ||= {};
  MODULES[moduleId][exportName] = implementation;
}

globalThis.__webpack_require__ = (id) => {
  const [moduleId] = id.split("#");
  return MODULES[moduleId];
};

// We don't expect it to be used.
globalThis.__webpack_chunk_load__ = (id) => {
  throw new Error(
    "__webpack_chunk_load__ is not supported. Trying to load module: " + id,
  );
};

type Module = Record<string, unknown>;

declare global {
  // react-server-dom-webpack expects __webpack_require__ and
  // __webpack_chunk_load__ to be available.

  function __webpack_require__(id: string): Module;

  function __webpack_chunk_load__(id: string): Promise<Module>;
}
