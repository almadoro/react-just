import { IncomingMessage } from "node:http";
import { TLSSocket } from "node:tls";
import { Request } from "../../../types/server";

export function incomingMessageToRequest(
  incomingMessage: IncomingMessage,
): Request {
  const { method, headers: rawHeaders, url = "" } = incomingMessage;

  if (method !== "GET")
    throw new Error(
      `Method ${method} not supported. Only GET requests are supported.`,
    );

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
    incomingMessage.headers["x-forwarded-proto"] === "https";

  const protocol = isHttps ? "https" : "http";

  const host =
    incomingMessage.headers["x-forwarded-host"] || headers.get("host");

  return {
    url: new URL(url, `${protocol}://${host}`),
    headers,
  };
}
