import { IncomingMessage } from "node:http";
import { Readable } from "node:stream";
import { TLSSocket } from "node:tls";
import { Plugin, RunnableDevEnvironment } from "vite";
import { RESOLVED_CSS_MODULES } from "./css";
import {
  CLIENT_ENTRY,
  FIZZ_ENTRY_NODE,
  FizzEntryNodeModule,
  FLIGHT_ENTRY_NODE,
  FlightEntryNodeModule,
} from "./entries";
import { ENVIRONMENTS } from "./environments";
import { RESOLVED_CLIENT_MODULES } from "./use-client";
import { invalidateModules } from "./utils";

type ServerOptions = {
  rscMimeType: string;
};

export default function server(options: ServerOptions): Plugin {
  return {
    name: "react-just:server",
    apply: "serve",
    configureServer(server) {
      const flight = server.environments[
        ENVIRONMENTS.FLIGHT_NODE
      ] as RunnableDevEnvironment;
      const fizz = server.environments[
        ENVIRONMENTS.FIZZ_NODE
      ] as RunnableDevEnvironment;
      const client = server.environments[
        ENVIRONMENTS.CLIENT
      ] as RunnableDevEnvironment;

      return () =>
        server.middlewares.use(async (req, res, next) => {
          try {
            if (req.method !== "GET") {
              res.statusCode = 405;
              res.end("Method Not Allowed");
              return;
            }

            const {
              App,
              renderToPipeableStream: renderToPipeableRscStream,
              React,
            } = await importFlightEntry(flight);

            // Loading the flight entry module can trigger changes on the client
            // modules module and css modules module.
            invalidateModules(fizz, RESOLVED_CLIENT_MODULES);
            invalidateModules(
              client,
              RESOLVED_CLIENT_MODULES,
              RESOLVED_CSS_MODULES,
            );

            const { renderToPipeableStream: renderToPipeableHtmlStream } =
              await importFizzEntry(fizz);

            // Vite rewrites the url path. Use the original url to get the
            // correct path.
            if (req.originalUrl) req.url = req.originalUrl;

            const request = incomingMessageToRequest(req);

            const rscStream = renderToPipeableRscStream(
              React.createElement(
                React.Fragment,
                null,
                React.createElement("script", {
                  async: true,
                  type: "module",
                  src: CLIENT_ENTRY,
                }),
                React.createElement(App, { req: request }),
              ),
            );

            if (req.headers.accept?.includes(options.rscMimeType)) {
              res.statusCode = 200;
              res.setHeader("content-type", options.rscMimeType);
              rscStream.pipe(res);
              return;
            }

            const htmlStream = renderToPipeableHtmlStream(rscStream);
            res.statusCode = 200;
            res.setHeader("content-type", "text/html");
            htmlStream.pipe(res);
          } catch (err) {
            next(err);
          }
        });
    },
  };
}

const MAX_FLIGHT_ENTRY_IMPORT_ATTEMPTS = 5;

async function importFlightEntry(
  env: RunnableDevEnvironment,
): Promise<FlightEntryNodeModule> {
  for (let i = 0; i < MAX_FLIGHT_ENTRY_IMPORT_ATTEMPTS; i++) {
    try {
      return await env.runner.import(FLIGHT_ENTRY_NODE);
    } catch (err) {
      if (!isOutdatedOptimizedDepErr(err)) throw err;
    }
  }

  throw new Error(
    "Too many attempts to import flight entry module\n" +
      "Please, report this issue on https://github.com/almadoro/react-just/issues\n" +
      "For a temporary solution, try restarting the server",
  );
}

const MAX_FIZZ_ENTRY_IMPORT_ATTEMPTS = 5;

async function importFizzEntry(
  env: RunnableDevEnvironment,
): Promise<FizzEntryNodeModule> {
  let currentBrowserHash = env.depsOptimizer?.metadata.browserHash;

  for (let i = 0; i < MAX_FIZZ_ENTRY_IMPORT_ATTEMPTS; i++) {
    try {
      const fizzEntryModule = await env.runner.import(FIZZ_ENTRY_NODE);

      let prevBrowserHash = currentBrowserHash;
      currentBrowserHash = env.depsOptimizer?.metadata.browserHash;

      const needsReload = prevBrowserHash !== currentBrowserHash;
      if (!needsReload) return fizzEntryModule;

      env.logger.info("mismatching versions of react. reloading", {
        timestamp: true,
      });
    } catch (err) {
      if (!isOutdatedOptimizedDepErr(err)) throw err;
    }
  }

  throw new Error(
    "Too many attempts to import fizz entry module\n" +
      "Please, report this issue on https://github.com/almadoro/react-just/issues\n" +
      "For a temporary solution, try restarting the server",
  );
}

function isOutdatedOptimizedDepErr(err: unknown) {
  return (
    err instanceof Error &&
    "code" in err &&
    err.code === "ERR_OUTDATED_OPTIMIZED_DEP"
  );
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
