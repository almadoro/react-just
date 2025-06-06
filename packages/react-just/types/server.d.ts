export function registerClientReference(
  proxyImplementation: unknown,
  id: string,
  exportName: string,
): void;

export interface Manifest {
  version: "1";
  publicDir: string;
  flight: { mimeType: string };
  app: ManifestEntry;
}

interface ManifestEntry {
  server: string;
  css: string[];
  js: string[];
}

export interface AppEntryProps {
  req: Request;
}

export interface Request {
  url: URL;
  headers: Headers;
}
