import { PipeableStream } from "@/types/shared";
import {
  registerClientReference as baseRegisterClientReference,
  renderToPipeableStream as baseRenderToPipeableStream,
} from "react-server-dom-webpack/server.node";

/* @__NO_SIDE_EFFECTS__ */
export function registerClientReference(
  moduleId: string | number,
  exportName: string | number,
) {
  return baseRegisterClientReference(
    {},
    moduleId.toString(),
    exportName.toString(),
  );
}

export function renderToPipeableStream(model: React.ReactNode): PipeableStream {
  return baseRenderToPipeableStream(model, clientMap);
}

const clientMap = new Proxy(
  {},
  {
    get(_, prop) {
      if (typeof prop !== "string") return null;
      const [, name] = prop.split("#");
      return { id: prop, chunks: [], name, async: false };
    },
  },
);
