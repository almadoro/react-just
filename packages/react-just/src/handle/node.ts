import { Context } from "@/types/flight.node";
import { HandleOptions } from "@/types/handle.node";
import {
  JustRequest,
  JustResponse,
  ReactClientValue,
  ReactFormState,
  RscPayload,
} from "@/types/shared";
import {
  IncomingHttpHeaders,
  IncomingMessage,
  ServerResponse,
} from "node:http";
import { Readable } from "node:stream";
import { TLSSocket } from "node:tls";
import { RSC_FUNCTION_ID_HEADER, RSC_MIME_TYPE } from "../constants";
import { getImplementation } from "../implementations";

export function createHandle({
  App,
  decodeAction,
  decodeFormState,
  decodeReply,
  React,
  renderToPipeableHtmlStream,
  renderToPipeableRscStream,
  runWithContext,
}: HandleOptions) {
  function render(
    res: ServerResponse,
    ctx: Context,
    formState: ReactFormState | null,
  ) {
    const rscStream = renderToPipeableRscStream({
      formState,
      tree: React.createElement(App),
    } satisfies RscPayload);

    const isRscRequest = ctx.req.headers.get("accept")?.includes(RSC_MIME_TYPE);

    res.statusCode = 200;
    // Indicate the browser to use different cache based on the accept header.
    res.setHeader("vary", "accept");

    if (isRscRequest) {
      res.setHeader("content-type", RSC_MIME_TYPE);
      rscStream.pipe(res);
    } else {
      res.setHeader("content-type", "text/html");
      const htmlStream = renderToPipeableHtmlStream(rscStream, { formState });
      htmlStream.pipe(res);
    }
  }

  function handleGet(res: ServerResponse, ctx: Context) {
    return render(res, ctx, null);
  }

  async function handlePost(
    req: IncomingMessage,
    res: ServerResponse,
    ctx: Context,
  ) {
    const fnId = req.headers[RSC_FUNCTION_ID_HEADER];

    // The form was submitted before hydration.
    if (typeof fnId !== "string") {
      const formData = await incomingMessageToRequest(req).formData();
      const fn = (await decodeAction(formData)) ?? (() => null);
      const result = await fn.apply(null, []);
      const formState = await decodeFormState<ReactClientValue>(
        // @ts-ignore
        result,
        formData,
      );
      return render(res, ctx, formState);
    }

    const fn = getImplementation(fnId) as Function;

    if (!fn) {
      res.statusCode = 404;
      res.setHeader("content-type", "text/plain");
      res.end(`Function not found: ${fnId}`);
      return;
    }

    const payload = await decodeReply<unknown[]>(req);
    const result = await fn.apply(null, payload);
    const rscStream = renderToPipeableRscStream(result);
    res.statusCode = 200;
    rscStream.pipe(res);
  }

  return (req: IncomingMessage, res: ServerResponse) => {
    const request = incomingMessageToJustRequest(req);
    const response: JustResponse = { headers: new Headers() };
    const ctx: Context = { req: request, res: response };

    if (req.method === "GET")
      return runWithContext(ctx, () => handleGet(res, ctx));

    if (req.method === "POST")
      return runWithContext(ctx, () => handlePost(req, res, ctx));

    res.statusCode = 405;
    res.end();
  };
}

function incomingMessageToJustRequest(
  incomingMessage: IncomingMessage,
): JustRequest {
  const headers = new Headers();
  copyIncomingMessageHeaders(incomingMessage.headers, headers);
  return {
    headers,
    method: incomingMessage.method!,
    url: getIncomingMessageUrl(incomingMessage),
  };
}

function incomingMessageToRequest(incomingMessage: IncomingMessage): Request {
  const { method } = incomingMessage;

  const headers = new Headers();
  copyIncomingMessageHeaders(incomingMessage.headers, headers);

  let body: BodyInit | undefined = undefined;
  if (method !== "GET" && method !== "HEAD")
    body = Readable.toWeb(incomingMessage) as ReadableStream;

  return new Request(getIncomingMessageUrl(incomingMessage), {
    method,
    headers,
    body,
    // @ts-expect-error - This is a valid property only on Node.js
    duplex: "half",
  });
}

function getIncomingMessageUrl(incomingMessage: IncomingMessage) {
  const isHttps =
    incomingMessage.socket instanceof TLSSocket ||
    incomingMessage.headers["x-forwarded-proto"] === "https";

  const protocol = isHttps ? "https" : "http";

  const host =
    incomingMessage.headers["x-forwarded-host"] ||
    incomingMessage.headers["host"];
  return new URL(incomingMessage.url ?? "", `${protocol}://${host}`).href;
}

function copyIncomingMessageHeaders(from: IncomingHttpHeaders, to: Headers) {
  for (const [key, value] of Object.entries(from)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        to.append(key, v);
      }
    } else if (typeof value === "string") {
      to.set(key, value);
    }
  }
}
