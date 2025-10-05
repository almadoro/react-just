import { PipeableStream } from "@/types/shared";
import {
  registerClientReference as baseRegisterClientReference,
  registerServerReference as baseRegisterServerReference,
  renderToPipeableStream as baseRenderToPipeableStream,
} from "react-server-dom-webpack/server.node";
import { registerAction } from "../actions";

/* @__NO_SIDE_EFFECTS__ */
export function registerClientReference(
  moduleId: string | number,
  exportName: string | number,
): unknown {
  return baseRegisterClientReference(
    {},
    moduleId.toString(),
    exportName.toString(),
  );
}

export function registerServerReference<T extends Function>(
  reference: T,
  id: string,
  exportName: null | string,
): T {
  registerAction(id, reference);
  return baseRegisterServerReference(reference, id, exportName);
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
