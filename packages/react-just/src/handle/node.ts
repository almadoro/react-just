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
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  React,
  renderToPipeableHtmlStream,
  renderToPipeableRscStream,
  runWithContext,
  onShellError,
}: HandleOptions) {
  function render(
    req: IncomingMessage,
    res: ServerResponse,
    formState: ReactFormState | null,
  ) {
    const isRscRequest = req.headers["accept"]?.includes(RSC_MIME_TYPE);

    // Indicate the browser to use different cache based on the accept header.
    res.setHeader("vary", "accept");

    if (isRscRequest) renderRsc(res, formState);
    else renderHtml(res, formState);
  }

  function renderRsc(res: ServerResponse, formState: ReactFormState | null) {
    const rscStream = renderToPipeableRscStream(
      { formState, tree: React.createElement(App) } satisfies RscPayload,
      { temporaryReferences: createTemporaryReferenceSet() },
    );

    res.statusCode = 200;
    res.setHeader("content-type", RSC_MIME_TYPE);
    rscStream.pipe(res);
  }

  function renderHtml(res: ServerResponse, formState: ReactFormState | null) {
    const rscStream = renderToPipeableRscStream(
      { formState, tree: React.createElement(App) } satisfies RscPayload,
      { temporaryReferences: createTemporaryReferenceSet() },
    );

    const htmlStream = renderToPipeableHtmlStream(rscStream, {
      formState,
      onShellReady: () => {
        res.statusCode = 200;
        res.setHeader("content-type", "text/html");
        htmlStream.pipe(res);
      },
      onShellError: onShellError ?? (() => DEFAULT_ON_SHELL_ERROR(res)),
    });
  }

  function handleGet(req: IncomingMessage, res: ServerResponse) {
    return render(req, res, null);
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
      res.setHeaders(ctx.res.headers);
      const formState = await decodeFormState<ReactClientValue>(
        // @ts-ignore
        result,
        formData,
      );
      return render(req, res, formState);
    }

    const fn = getImplementation(fnId) as Function;

    if (!fn) {
      res.statusCode = 404;
      res.setHeader("content-type", "text/plain");
      res.end(`Function not found: ${fnId}`);
      return;
    }

    const temporaryReferences = createTemporaryReferenceSet();
    const payload = await decodeReply<unknown[]>(req, { temporaryReferences });
    const result = await fn.apply(null, payload);
    res.setHeaders(ctx.res.headers);
    const rscStream = renderToPipeableRscStream(result, {
      temporaryReferences,
    });
    res.statusCode = 200;
    res.setHeader("content-type", RSC_MIME_TYPE);
    rscStream.pipe(res);
  }

  return (req: IncomingMessage, res: ServerResponse) => {
    const request = incomingMessageToJustRequest(req);
    const response: JustResponse = { headers: new Headers() };
    const ctx: Context = { req: request, res: response };

    if (req.method === "GET")
      return runWithContext(ctx, () => handleGet(req, res));

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

const DEFAULT_ON_SHELL_ERROR = (res: ServerResponse) => {
  res.statusCode = 500;
  res.setHeader("content-type", "text/html");
  res.end(ERROR_HTML);
};

const ERROR_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Error</title>
    <style>
      :root {
        color-scheme: light dark;
      }

      html {
        height: 100%;
        margin: 0;
        font-family:
          system-ui,
          -apple-system,
          "Segoe UI",
          Roboto,
          Helvetica,
          Arial,
          sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: #fff;
        color: #222;
      }

      h1 {
        margin-bottom: 4px;
        font-size: 3rem;
        font-weight: 700;
      }

      .subtitle {
        margin-bottom: 12px;
        font-size: 0.85rem;
        color: #666;
      }

      @media (prefers-color-scheme: dark) {
        html {
          background: #111;
          color: #eee;
        }

        .subtitle {
          color: #aaa;
        }
      }
    </style>
  </head>
  <body>
    <div>
      <h1>500</h1>
      <p class="subtitle">Internal Server Error</p>
    </div>
  </body>
</html>`;
