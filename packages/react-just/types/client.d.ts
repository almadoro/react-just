export function hydrateFromWindowFlight(): void;

export function registerModule(id: string, module: Module): void;

type Module = Record<string, unknown>;

export interface AppEntryProps {
  req: Request;
}

export interface Request {
  url: URL;
  headers: Headers;
}
