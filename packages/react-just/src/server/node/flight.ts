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

let clientMap: ClientManifest;

if (process.env.NODE_ENV === "production") {
  clientMap = new Proxy(
    {},
    {
      get(_, prop) {
        if (typeof prop !== "string") return null;
        const [, name] = prop.split("#");

        return { id: prop, chunks: [], name, async: false };
      },
    },
  );
} else {
  clientMap = new Proxy(
    {},
    {
      get(_, prop) {
        if (typeof prop !== "string") return null;
        const [file, name] = prop.split("#");
        // Load the modules dynamically on development
        return { id: prop, chunks: [file], name, async: true };
      },
    },
  );
}
