import { HandleOptions } from "@/types/handle.node";
import { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { TLSSocket } from "node:tls";
import { RSC_FUNCTION_ID_HEADER, RSC_MIME_TYPE } from "../constants";
import { getServerFunction } from "../server-functions";

export function createHandle({
  App,
  decodePayloadIncomingMessage,
  React,
  renderToPipeableHtmlStream,
  renderToPipeableRscStream,
}: HandleOptions) {
  function handleGet(req: IncomingMessage, res: ServerResponse) {
    const rscStream = renderToPipeableRscStream(
      React.createElement(App, { req: incomingMessageToRequest(req) }),
    );

    const isRscRequest = req.headers.accept?.includes(RSC_MIME_TYPE);

    res.statusCode = 200;
    // Indicate the browser to use different cache based on the accept header.
    res.setHeader("vary", "accept");

    if (isRscRequest) {
      res.setHeader("content-type", RSC_MIME_TYPE);
      rscStream.pipe(res);
    } else {
      res.setHeader("content-type", "text/html");
      const htmlStream = renderToPipeableHtmlStream(rscStream);
      htmlStream.pipe(res);
    }
  }

  async function handlePost(req: IncomingMessage, res: ServerResponse) {
    const payload = await decodePayloadIncomingMessage<unknown[]>(req);

    const fnId = req.headers[RSC_FUNCTION_ID_HEADER];

    if (typeof fnId !== "string") {
      res.statusCode = 400;
      res.setHeader("content-type", "text/plain");
      res.end("Function ID required");
      return;
    }

    const fn = getServerFunction(fnId);

    if (!fn) {
      res.statusCode = 404;
      res.setHeader("content-type", "text/plain");
      res.end(`Function not found: ${fnId}`);
      return;
    }

    const result = await fn.apply(null, payload);
    const rscStream = renderToPipeableRscStream(result);
    res.statusCode = 200;
    rscStream.pipe(res);
  }

  return (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "GET") return handleGet(req, res);
    if (req.method === "POST") return handlePost(req, res);

    res.statusCode = 405;
    res.end();
  };
}

function incomingMessageToRequest(incomingMessage: IncomingMessage): Request {
  const { method, headers: rawHeaders, url = "" } = incomingMessage;

  const headers = new Headers();
  for (const [key, value] of Object.entries(rawHeaders)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        headers.append(key, v);
      }
    } else if (typeof value === "string") {
      headers.set(key, value);
    }
  }

  const isHttps =
    incomingMessage.socket instanceof TLSSocket ||
    rawHeaders["x-forwarded-proto"] === "https";

  const protocol = isHttps ? "https" : "http";

  const host = rawHeaders["x-forwarded-host"] || headers.get("host");

  let body: BodyInit | undefined = undefined;
  if (method !== "GET" && method !== "HEAD")
    body = Readable.toWeb(incomingMessage) as ReadableStream;

  return new Request(new URL(url, `${protocol}://${host}`), { headers, body });
}
