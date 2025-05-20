// Inspired by next.js implementation
// https://github.com/vercel/next.js/blob/canary/packages/next/src/server/app-render/use-flight-response.tsx
// https://github.com/vercel/next.js/blob/canary/packages/next/src/client/app-index.tsx

export const FLIGHT_WINDOW_IDENTIFIER = "__RJF__";

export const FLIGHT_STRING_DATA = 1;
export const FLIGHT_BINARY_DATA = 2;

export type FlighChunk = StringDataChunk | BinaryDataChunk;

export type StringDataChunk = [type: typeof FLIGHT_STRING_DATA, str: string];
export type BinaryDataChunk = [type: typeof FLIGHT_BINARY_DATA, base64: string];

declare global {
  interface Window {
    [FLIGHT_WINDOW_IDENTIFIER]: Iterable<FlighChunk> & {
      push: (chunk: FlighChunk) => void;
    };
  }
}
