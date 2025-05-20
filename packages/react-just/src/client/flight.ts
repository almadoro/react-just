import { hydrateRoot } from "react-dom/client";
import { createFromReadableStream } from "react-server-dom/client.browser";
import {
  FlighChunk,
  FLIGHT_BINARY_DATA,
  FLIGHT_STRING_DATA,
  FLIGHT_WINDOW_IDENTIFIER,
} from "../flight";

export async function hydrateFromWindowFlight() {
  const stream = createFlightReadableStream();
  const tree = await createFromReadableStream<React.ReactNode>(stream);
  hydrateRoot(document, tree);
}

function createFlightReadableStream() {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      function handleChunk(chunk: FlighChunk) {
        const [type, data] = chunk;
        switch (type) {
          case FLIGHT_STRING_DATA:
            controller.enqueue(encoder.encode(data));
            break;
          case FLIGHT_BINARY_DATA:
            const binaryStr = atob(data);
            const decodedChunk = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              decodedChunk[i] = binaryStr.charCodeAt(i);
            }
            controller.enqueue(decodedChunk);
            break;
          default:
            console.warn(`Unknown flight chunk type: ${type}`);
        }
      }

      window[FLIGHT_WINDOW_IDENTIFIER] ||= [] as FlighChunk[];

      for (const chunk of window[FLIGHT_WINDOW_IDENTIFIER]) {
        handleChunk(chunk);
      }

      window[FLIGHT_WINDOW_IDENTIFIER].push = handleChunk;

      document.addEventListener("DOMContentLoaded", () => controller.close());
    },
  });
}
