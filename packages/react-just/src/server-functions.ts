globalThis.__RJ_SERVER_FUNCTIONS__ ||= {};

export function getServerFunction(id: string): Function | null {
  return globalThis.__RJ_SERVER_FUNCTIONS__[id] ?? null;
}

export function registerServerFunction(id: string, reference: Function) {
  if (!(reference instanceof AsyncFunction))
    throw new Error(`Server functions must be async functions: ${id}`);

  globalThis.__RJ_SERVER_FUNCTIONS__[id] = reference;
}

const AsyncFunction = (async () => {}).constructor;

declare global {
  var __RJ_SERVER_FUNCTIONS__: Record<string, Function>;
}
