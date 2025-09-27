// module has side effects that are required to be executed before any
// react-server-dom-webpack imports.
import "./modules";

import { hydrateRoot } from "react-dom/client";
import {
  createFromFetch,
  createFromReadableStream,
} from "react-server-dom-webpack/client.browser";
import { registerModuleExport } from "./modules";
import {
  RSC_STREAM_BINARY_DATA,
  RSC_STREAM_STRING_DATA,
  RSC_STREAM_WINDOW_IDENTIFIER,
  RscStreamChunk,
} from "./rsc-stream";

export const WINDOW_SHARED = Symbol.for("react-just.window-shared");

export function createFromRscFetch<T>(res: Promise<Response>): PromiseLike<T> {
  return createFromFetch(res);
}

export async function hydrateFromWindowStream() {
  const stream = createRscReadableStream();
  const tree = await createFromReadableStream<React.ReactNode>(stream);
  return hydrateRoot(document, tree);
}

export function registerClientReference(
  implementation: unknown,
  moduleId: string | number,
  exportName: string | number,
): unknown {
  registerModuleExport(implementation, moduleId, exportName);
  return implementation;
}

function createRscReadableStream() {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      function handleChunk(chunk: RscStreamChunk) {
        const [type, data] = chunk;
        switch (type) {
          case RSC_STREAM_STRING_DATA:
            controller.enqueue(encoder.encode(data));
            break;
          case RSC_STREAM_BINARY_DATA:
            const binaryStr = atob(data);
            const decodedChunk = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              decodedChunk[i] = binaryStr.charCodeAt(i);
            }
            controller.enqueue(decodedChunk);
            break;
          default:
            console.warn(`Unknown stream chunk type: ${type}`);
        }
      }

      window[RSC_STREAM_WINDOW_IDENTIFIER] ||= [] as RscStreamChunk[];

      for (const chunk of window[RSC_STREAM_WINDOW_IDENTIFIER]) {
        handleChunk(chunk);
      }

      window[RSC_STREAM_WINDOW_IDENTIFIER].push = handleChunk;

      document.addEventListener("DOMContentLoaded", () => controller.close());
    },
  });
}
