// module has side effects that are required to be executed before any
// react-server-dom-webpack imports.
import "./modules";

import {
  createElement,
  ReactNode,
  startTransition,
  useEffect,
  useState,
} from "react";
import { hydrateRoot } from "react-dom/client";
import {
  createFromFetch,
  createFromReadableStream,
  createServerReference,
  encodeReply,
} from "react-server-dom-webpack/client.browser";
import { RSC_FUNCTION_ID_HEADER, RSC_MIME_TYPE } from "./constants";
import { registerModuleExport } from "./modules";
import {
  RSC_STREAM_BINARY_DATA,
  RSC_STREAM_STRING_DATA,
  RSC_STREAM_WINDOW_IDENTIFIER,
  RscStreamChunk,
} from "./rsc-stream";

export function createFromRscFetch<T>(res: Promise<Response>): PromiseLike<T> {
  return createFromFetch(res);
}

export async function hydrateFromWindowStream(): Promise<void> {
  const stream = createRscReadableStream();
  const initialTree = await createFromReadableStream<ReactNode>(stream);

  function Root() {
    const [tree, setTree] = useState<ReactNode>(initialTree);

    useEffect(() => {
      const previousRender = _render;
      _render = (tree: ReactNode) => startTransition(() => setTree(tree));

      return () => {
        _render = previousRender;
      };
    }, []);

    return tree;
  }

  startTransition(() => {
    hydrateRoot(document, createElement(Root));
  });
}

export function registerClientReference(
  implementation: unknown,
  moduleId: string | number,
  exportName: string | number,
): unknown {
  registerModuleExport(implementation, moduleId, exportName);
  return implementation;
}

export function registerServerReference<TArgs extends unknown[], TReturn>(
  id: string,
): (...args: TArgs) => Promise<TReturn> {
  return createServerReference(id, callServer);
}

export function render(tree: ReactNode): void {
  _render?.(tree);
}

export { RSC_MIME_TYPE };

let _render: typeof render = () =>
  console.error("\`render\` method hasn't been initialized");

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

async function callServer(id: string, args: unknown[]) {
  return createFromFetch(
    fetch(window.location.href, {
      method: "POST",
      body: await encodeReply(args),
      headers: { [RSC_FUNCTION_ID_HEADER]: id },
    }),
  );
}
