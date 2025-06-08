const MODULES: Record<string, Module> = {};

export function registerModule(id: string, module: Module) {
  MODULES[id] = module;
}

export function registerModuleExport(
  id: string,
  exportName: string,
  value: unknown,
) {
  MODULES[id] ||= {};
  MODULES[id][exportName] = value;
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
