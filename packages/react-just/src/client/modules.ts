const MODULES: Record<string, Module> = {};

export function registerModule(id: string, module: Module) {
  MODULES[id] = module;
}

globalThis.__webpack_require__ = (id) => {
  const [moduleId] = id.split("#");
  return MODULES[moduleId];
};

if (process.env.NODE_ENV !== "production") {
  // We expect it to be used by vite in development to load modules dynamically.
  globalThis.__webpack_chunk_load__ = async (id) => {
    if (MODULES[id]) return MODULES[id];
    const module = await import(id);
    MODULES[id] = module;
    return module;
  };
} else {
  // We don't expect it to be used in production.
  globalThis.__webpack_chunk_load__ = (id) => {
    throw new Error(
      "__webpack_chunk_load__ is not supported. Trying to load module: " + id,
    );
  };
}
