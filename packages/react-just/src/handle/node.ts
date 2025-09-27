import { HandleOptions } from "@/types/handle.node";
import { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { TLSSocket } from "node:tls";
import { RSC_MIME_TYPE } from "../constants";

export function createHandle({
  App,
  React,
  renderToPipeableHtmlStream,
  renderToPipeableRscStream,
}: HandleOptions) {
  return (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.end();
      return;
    }

    const rscStream = renderToPipeableRscStream(
      React.createElement(App, { req: incomingMessageToRequest(req) }),
    );

    const isRscRequest = req.headers.accept?.includes(RSC_MIME_TYPE);

    if (isRscRequest) {
      res.statusCode = 200;
      res.setHeader("content-type", RSC_MIME_TYPE);
      rscStream.pipe(res);
    } else {
      res.statusCode = 200;
      res.setHeader("content-type", "text/html");
      const htmlStream = renderToPipeableHtmlStream(rscStream);
      htmlStream.pipe(res);
    }
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
