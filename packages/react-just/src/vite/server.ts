import { Request } from "@/types/server";
import { IncomingMessage } from "node:http";
import { TLSSocket } from "node:tls";
import {
  DevEnvironment,
  EnvironmentModuleGraph,
  Plugin,
  RunnableDevEnvironment,
} from "vite";
import { RESOLVED_CSS_MODULES } from "./css";
import {
  CLIENT_ENTRY,
  FIZZ_ENTRY_NODE,
  FizzEntryNodeModule,
  FLIGHT_ENTRY_NODE,
  FlightEntryNodeModule,
} from "./entries";
import { ENVIRONMENTS } from "./environments";
import { RESOLVED_CLIENT_MODULES, UseClientApi } from "./use-client";
import { isCssModule } from "./utils";

type ServerOptions = {
  rscMimeType: string;
  useClientApi: UseClientApi;
};

export default function server(options: ServerOptions): Plugin {
  const { useClientApi } = options;

  return {
    name: "react-just:server",
    configureServer(server) {
      const flight = server.environments[
        ENVIRONMENTS.FLIGHT_NODE
      ] as RunnableDevEnvironment;
      const fizz = server.environments[
        ENVIRONMENTS.FIZZ_NODE
      ] as RunnableDevEnvironment;
      const client = server.environments[ENVIRONMENTS.CLIENT] as DevEnvironment;

      return () =>
        server.middlewares.use(async (req, res, next) => {
          try {
            const {
              App,
              renderToPipeableStream: renderToPipeableRscStream,
              React,
            } = (await flight.runner.import(
              FLIGHT_ENTRY_NODE,
            )) as FlightEntryNodeModule;

            await removeUnusedClientModules(flight.moduleGraph, useClientApi);
            await removeUnusedCssModules(flight.moduleGraph, client);
            invalidateDynamicVirtualModules(fizz);
            invalidateDynamicVirtualModules(client);

            const { renderToPipeableStream: renderToPipeableHtmlStream } =
              await importFizzEntry(fizz);

            const request = incomingMessageToRequest(req);

            // Vite rewrites the url path. Use the original url to get the
            // correct path.
            if (req.originalUrl) request.url.pathname = req.originalUrl;

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

async function removeUnusedClientModules(
  flightModuleGraph: EnvironmentModuleGraph,
  useClientApi: UseClientApi,
) {
  const { idToModuleMap } = flightModuleGraph;

  const ids: string[] = [];

  // Only app client modules will be removed, since package modules appear
  // under optimized dependencies. There is currently no feasible way to
  // remove them.
  for (const [id, module] of idToModuleMap.entries()) {
    if (module.importers.size === 0) ids.push(id);
  }

  await useClientApi.removeModules(ids);
}

async function removeUnusedCssModules(
  flightModuleGraph: EnvironmentModuleGraph,
  client: DevEnvironment,
) {
  const urls: string[] = [];

  for (const [url, module] of flightModuleGraph.urlToModuleMap.entries()) {
    if (isCssModule(url) && module.importers.size === 0) {
      urls.push(url);
    }
  }

  for (const url of urls) {
    // update hmr timestamp to make the browser re-import the module when
    // re-referenced.
    // https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/hmr.ts#L935
    const module = await client.moduleGraph.getModuleByUrl(url);
    if (module) module.lastHMRTimestamp = Date.now();
  }

  // Css modules are not pruned automatically when referenced only by
  // flight environment.
  client.hot.send({ type: "prune", paths: urls });
}

function invalidateDynamicVirtualModules(env: DevEnvironment) {
  // Since client modules module and css module are dynamic virtual modules
  // these are not invalidated automatically.
  const clientModulesModule = env.moduleGraph.getModuleById(
    RESOLVED_CLIENT_MODULES,
  );
  if (clientModulesModule)
    env.moduleGraph.invalidateModule(clientModulesModule);

  const cssModule = env.moduleGraph.getModuleById(RESOLVED_CSS_MODULES);
  if (cssModule) env.moduleGraph.invalidateModule(cssModule);
}

const MAX_FIZZ_ENTRY_IMPORT_ATTEMPTS = 5;

async function importFizzEntry(
  env: RunnableDevEnvironment,
): Promise<FizzEntryNodeModule> {
  let currentBrowserHash = env.depsOptimizer?.metadata.browserHash;

  for (let i = 0; i < MAX_FIZZ_ENTRY_IMPORT_ATTEMPTS; i++) {
    const fizzEntryModule = await env.runner.import(FIZZ_ENTRY_NODE);

    let prevBrowserHash = currentBrowserHash;
    currentBrowserHash = env.depsOptimizer?.metadata.browserHash;

    const needsReload = prevBrowserHash !== currentBrowserHash;
    if (!needsReload) return fizzEntryModule;

    env.logger.info("mismatching versions of React. Reloading", {
      timestamp: true,
    });
  }

  throw new Error(
    "Too many attempts to import fizz entry module\n" +
      "Please, report this issue on https://github.com/almadoro/react-just/issues\n" +
      "For a temporary solution, try restarting the server",
  );
}

function incomingMessageToRequest(incomingMessage: IncomingMessage): Request {
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
