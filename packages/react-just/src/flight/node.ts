import { PipeableStream } from "@/types/shared";
import busboy from "busboy";
import { IncomingMessage } from "node:http";
import {
  registerClientReference as baseRegisterClientReference,
  registerServerReference as baseRegisterServerReference,
  renderToPipeableStream as baseRenderToPipeableStream,
  decodeReply,
  decodeReplyFromBusboy,
} from "react-server-dom-webpack/server.node";
import { registerServerFunction } from "../server-functions";

export async function decodePayloadIncomingMessage<T>(
  req: IncomingMessage,
): Promise<T> {
  const contentType = req.headers["content-type"];

  if (contentType?.startsWith("multipart/form-data")) {
    const bb = busboy({ headers: req.headers });
    req.pipe(bb);
    const payload = await decodeReplyFromBusboy<T>(bb, null);
    return payload;
  }

  const chunks: Buffer[] = [];
  await new Promise((resolve, reject) => {
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", resolve);
    req.on("error", reject);
  });
  const buffer = Buffer.concat(chunks);
  const payload = await decodeReply<T>(buffer.toString("utf-8"), null);
  return payload;
}

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
): T {
  registerServerFunction(id, reference);
  return baseRegisterServerReference(reference, id, null);
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
