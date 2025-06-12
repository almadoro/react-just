// Inspired by next.js implementation
// https://github.com/vercel/next.js/blob/canary/packages/next/src/server/app-render/use-flight-response.tsx
// https://github.com/vercel/next.js/blob/canary/packages/next/src/client/app-index.tsx

export const RSC_STREAM_WINDOW_IDENTIFIER = "__RJS__";

export const RSC_STREAM_STRING_DATA = 1;
export const RSC_STREAM_BINARY_DATA = 2;

export type RscStreamChunk = StringDataChunk | BinaryDataChunk;

export type StringDataChunk = [
  type: typeof RSC_STREAM_STRING_DATA,
  str: string,
];

export type BinaryDataChunk = [
  type: typeof RSC_STREAM_BINARY_DATA,
  base64: string,
];

declare global {
  interface Window {
    [RSC_STREAM_WINDOW_IDENTIFIER]: Iterable<RscStreamChunk> & {
      push: (chunk: RscStreamChunk) => void;
    };
  }
}
