import {
  ClientManifest,
  PipeableStream,
  ReactClientValue,
  renderToPipeableStream,
} from "react-server-dom/server.node";

export function renderToFlightPipeableStream(
  model: ReactClientValue,
): PipeableStream {
  return renderToPipeableStream(model, clientMap);
}

const clientMap: ClientManifest = new Proxy(
  {},
  {
    get(_, prop) {
      if (typeof prop !== "string") return null;
      const [, name] = prop.split("#");
      return { id: prop, chunks: [], name, async: false };
    },
  },
);
