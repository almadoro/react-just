import { PipeableStream } from "@/types/shared";
import {
  registerClientReference as baseRegisterClientReference,
  renderToPipeableStream as baseRenderToPipeableStream,
} from "react-server-dom-webpack/server.node";

export function registerClientReference(moduleId: string, exportName: string) {
  return baseRegisterClientReference({}, moduleId, exportName);
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
