import {
  PipeableStream,
  ReactClientValue,
  ReactFormState,
} from "@/types/shared";
import busboy from "busboy";
import { IncomingMessage } from "node:http";
import {
  decodeAction as baseDecodeAction,
  decodeFormState as baseDecodeFormState,
  registerClientReference as baseRegisterClientReference,
  registerServerReference as baseRegisterServerReference,
  renderToPipeableStream as baseRenderToPipeableStream,
  decodeReply,
  decodeReplyFromBusboy,
} from "react-server-dom-webpack/server.node";
import {
  IMPLEMENTATION_EXPORT_NAME,
  registerImplementation,
} from "../implementations";

export function decodeAction<T>(body: FormData): Promise<() => T> | null {
  return baseDecodeAction(body, serverMap);
}

export function decodeFormState<S>(
  actionResult: S,
  body: FormData,
): Promise<ReactFormState | null> {
  return baseDecodeFormState<S>(actionResult, body, serverMap);
}

export async function decodePayloadIncomingMessage<T>(
  req: IncomingMessage,
): Promise<T> {
  const contentType = req.headers["content-type"];

  if (contentType?.startsWith("multipart/form-data")) {
    const bb = busboy({ headers: req.headers });
    req.pipe(bb);
    const payload = await decodeReplyFromBusboy<T>(bb, serverMap);
    return payload;
  }

  const chunks: Buffer[] = [];
  await new Promise((resolve, reject) => {
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", resolve);
    req.on("error", reject);
  });
  const buffer = Buffer.concat(chunks);
  const payload = await decodeReply<T>(buffer.toString("utf-8"), serverMap);
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
  implementation: T,
  id: string,
): T {
  if (!(implementation instanceof AsyncFunction))
    throw new Error(`Server functions must be async functions: ${id}`);

  registerImplementation(implementation, id);

  return baseRegisterServerReference(implementation, id, null);
}

export function renderToPipeableStream(
  value: ReactClientValue,
): PipeableStream {
  return baseRenderToPipeableStream(value, clientMap);
}

const AsyncFunction = (async () => {}).constructor;

const clientMap = new Proxy(
  {},
  {
    get(_, prop) {
      if (typeof prop !== "string") return null;
      return {
        id: prop,
        chunks: [],
        name: IMPLEMENTATION_EXPORT_NAME,
        async: false,
      };
    },
  },
);

const serverMap = new Proxy(
  {},
  {
    get(_, prop) {
      if (typeof prop !== "string") return null;
      return {
        id: prop,
        chunks: [],
        name: IMPLEMENTATION_EXPORT_NAME,
        async: false,
      };
    },
  },
);
