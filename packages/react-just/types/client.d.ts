export function hydrateFromWindowFlight(): void;

export function registerModule(id: string, module: Module): void;

type Module = Record<string, unknown>;
