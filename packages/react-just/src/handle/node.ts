import { HandleOptions } from "@/types/handle.node";
import { ReactClientValue, ReactFormState, RscPayload } from "@/types/shared";
import { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { TLSSocket } from "node:tls";
import { RSC_FUNCTION_ID_HEADER, RSC_MIME_TYPE } from "../constants";
import { getImplementation } from "../implementations";

export function createHandle({
  App,
  decodeAction,
  decodeFormState,
  decodePayloadIncomingMessage,
  React,
  renderToPipeableHtmlStream,
  renderToPipeableRscStream,
  runWithContext,
}: HandleOptions) {
  function render(
    req: Request,
    res: ServerResponse,
    formState: ReactFormState | null,
  ) {
    const rscStream = renderToPipeableRscStream({
      formState,
      tree: React.createElement(App, { req }),
    } satisfies RscPayload);

    const isRscRequest = req.headers.get("accept")?.includes(RSC_MIME_TYPE);

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

  function handleGet(request: Request, res: ServerResponse) {
    return render(request, res, null);
  }

  async function handlePost(
    request: Request,
    req: IncomingMessage,
    res: ServerResponse,
  ) {
    const fnId = req.headers[RSC_FUNCTION_ID_HEADER];

    // The form was submitted before hydration.
    if (typeof fnId !== "string") {
      const formData = await request.formData();
      const fn = (await decodeAction(formData)) ?? (() => null);
      const result = await fn.apply(null, []);
      const formState = await decodeFormState<ReactClientValue>(
        // @ts-ignore
        result,
        formData,
      );
      return render(request, res, formState);
    }

    const fn = getImplementation(fnId) as Function;

    if (!fn) {
      res.statusCode = 404;
      res.setHeader("content-type", "text/plain");
      res.end(`Function not found: ${fnId}`);
      return;
    }

    const payload = await decodePayloadIncomingMessage<unknown[]>(req);
    const result = await fn.apply(null, payload);
    const rscStream = renderToPipeableRscStream(result);
    res.statusCode = 200;
    rscStream.pipe(res);
  }

  return (req: IncomingMessage, res: ServerResponse) => {
    const request = incomingMessageToRequest(req);
    const context = { req: request };
    if (req.method === "GET")
      return runWithContext(context, () => handleGet(request, res));
    if (req.method === "POST")
      return runWithContext(context, () => handlePost(request, req, res));

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

  return new Request(new URL(url, `${protocol}://${host}`), {
    method,
    headers,
    body,
    // @ts-expect-error - This is a valid property only on Node.js
    duplex: "half",
  });
}
