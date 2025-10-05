globalThis.__RJ_ACTIONS__ ||= {};

export function getAction(id: string): Function | null {
  return globalThis.__RJ_ACTIONS__[id] ?? null;
}

export function registerAction(id: string, reference: Function) {
  globalThis.__RJ_ACTIONS__[id] = reference;
}

declare global {
  var __RJ_ACTIONS__: Record<string, Function>;
}
