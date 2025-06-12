import { renderToPipeableStream as renderToPipeableHtmlStream } from "@/types/fizz.node";
import { renderToPipeableStream as renderToPipeableRscStream } from "@/types/flight.node";
import { AppEntryProps } from "@/types/server";
import type React from "react";
import type {
  Connect,
  DevEnvironment,
  Plugin,
  RunnableDevEnvironment,
  ViteDevServer,
} from "vite";
import { incomingMessageToRequest } from "../server/node/transform";
import {
  getInitializationCode,
  getModulesRegisteringCodeDevelopment,
} from "./utils/client";
import ENVIRONMENTS from "./utils/environments";
import { getAppEntryModuleId } from "./utils/server";

type DevOptions = { app?: string; rscMimeType: string };

export default function dev(options: DevOptions): Plugin {
  let clientModulesIds: string[] = [];
  let cssModulesIds: string[] = [];

  return {
    name: "react-just:dev",
    apply: "serve",
    config() {
      return {
        environments: {
          [ENVIRONMENTS.FLIGHT]: {
            consumer: "server",
            resolve: {
              conditions: ["react-server"],
              // Any package can contain the "use client" and "use server"
              // directives. These modules should be transformed so they
              // can't be externalized.
              noExternal: true,
            },
            optimizeDeps: {
              esbuildOptions: { conditions: ["react-server"] },
              // At the moment, React and complementary packages are
              // commonjs-only. We need to transform them to esm.
              // As far as I know, optimizeDeps.include is what should be used
              // to transform cjs to esm modules.
              include: [
                "react",
                "react/jsx-runtime",
                "react/jsx-dev-runtime",
                // Including react-just/flight.node triggers optimization of
                // react-server-dom-webpack.
                "react-just/flight.node",
              ],
            },
          },
          [ENVIRONMENTS.FIZZ]: {
            consumer: "server",
            optimizeDeps: {
              include: [
                "react",
                "react/jsx-runtime",
                "react/jsx-dev-runtime",
                "react-dom",
              ],
            },
          },
        },
      };
    },
    configureServer(server) {
      return () =>
        server.middlewares.use(async (req, res, next) => {
          try {
            const flightEnv = server.environments[
              ENVIRONMENTS.FLIGHT
            ] as RunnableDevEnvironment;
            const flightEntryModule = await flightEnv.runner.import(
              FLIGHT_ENTRY_MODULE_ID,
            );
            // Once we have loaded the latest app entry module we can extract
            // the client modules and css referenced modules.
            clientModulesIds = getClientModulesIds(flightEnv);
            cssModulesIds = getCssModulesIds(flightEnv);
            const fizzEnv = server.environments[
              ENVIRONMENTS.FIZZ
            ] as RunnableDevEnvironment;
            const fizzEntryModule =
              await fizzEnv.runner.import(FIZZ_ENTRY_MODULE_ID);
            serveApp(flightEntryModule, fizzEntryModule, options.rscMimeType)(
              req,
              res,
              next,
            );
          } catch (err) {
            next(err);
          }
        });
    },
    resolveId(id) {
      switch (id) {
        case FLIGHT_ENTRY_MODULE_ID:
          return RESOLVED_FLIGHT_ENTRY_MODULE_ID;
        case FIZZ_ENTRY_MODULE_ID:
          return RESOLVED_FIZZ_ENTRY_MODULE_ID;
        case CLIENT_ENTRY_MODULE_ID:
          return RESOLVED_CLIENT_ENTRY_MODULE_ID;
        case HMR_PREAMBLE_MODULE_ID:
          return RESOLVED_HMR_PREAMBLE_MODULE_ID;
        case APP_MODULES_MODULE_ID:
          return RESOLVED_APP_MODULES_MODULE_ID;
        case SERVER_HMR_MODULE_ID:
          return RESOLVED_SERVER_HMR_MODULE_ID;
      }
    },
    async load(id) {
      switch (id) {
        case RESOLVED_FLIGHT_ENTRY_MODULE_ID:
          return getFlightEntry(
            await getAppEntryModuleId(
              this.environment.config.root,
              options.app,
            ),
          );
        case RESOLVED_FIZZ_ENTRY_MODULE_ID:
          return getFizzEntry(clientModulesIds);
        case RESOLVED_CLIENT_ENTRY_MODULE_ID:
          return getClientEntry(options.rscMimeType);
        case RESOLVED_HMR_PREAMBLE_MODULE_ID:
          return getHmrPreambleCode();
        case RESOLVED_APP_MODULES_MODULE_ID:
          return getAppModulesCode(clientModulesIds, cssModulesIds);
        case RESOLVED_SERVER_HMR_MODULE_ID:
          return getServerHmrCode();
      }
    },
    hotUpdate(ctx) {
      if (this.environment.name === ENVIRONMENTS.FLIGHT)
        onFlightHotUpdate(ctx.server);
    },
  };
}

const FLIGHT_ENTRY_MODULE_ID = "/virtual:react-just/flight-entry";
const RESOLVED_FLIGHT_ENTRY_MODULE_ID = "\0" + FLIGHT_ENTRY_MODULE_ID;

function getFlightEntry(appModuleId: string) {
  // Render functions and App entry must be imported together to share modules
  // registering.
  return (
    `import React from "react";` +
    `import { renderToPipeableStream } from "react-just/flight.node";` +
    `import App from "${appModuleId}";` +
    `export { React, renderToPipeableStream, App };`
  );
}

type FlightEntryModule = {
  React: typeof React;
  renderToPipeableStream: typeof renderToPipeableRscStream;
  App: React.ComponentType<AppEntryProps>;
};

// Taken from: https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts#L92
const CSS_EXTENSIONS_RE =
  /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)($|\?)/;

function getCssModulesIds(env: DevEnvironment) {
  const { idToModuleMap } = env.moduleGraph;

  const cssModulesIds: string[] = [];

  for (const id of idToModuleMap.keys()) {
    if (CSS_EXTENSIONS_RE.test(id)) cssModulesIds.push(id);
  }

  return cssModulesIds;
}

function getClientModulesIds(env: DevEnvironment) {
  const { idToModuleMap } = env.moduleGraph;

  const clientModulesIds: string[] = [];

  for (const id of idToModuleMap.keys()) {
    const meta = env.pluginContainer.getModuleInfo(id)?.meta;
    if (meta?.reactUseClient?.transformed) clientModulesIds.push(id);
  }

  return clientModulesIds;
}

const FIZZ_ENTRY_MODULE_ID = "/virtual:react-just/fizz-entry";
const RESOLVED_FIZZ_ENTRY_MODULE_ID = "\0" + FIZZ_ENTRY_MODULE_ID;

function getFizzEntry(clientModulesIds: string[]) {
  let code = `export { renderToPipeableStream } from "react-just/fizz.node";`;

  for (const id of clientModulesIds) {
    code += `import "${id}";`;
  }

  return code;
}

type FizzEntryModule = {
  renderToPipeableStream: typeof renderToPipeableHtmlStream;
};

function serveApp(
  flightEntryModule: FlightEntryModule,
  fizzEntryModule: FizzEntryModule,
  rscMimeType: string,
): Connect.NextHandleFunction {
  return async (req, res) => {
    const {
      renderToPipeableStream: renderToPipeableRscStream,
      App,
      React,
    } = flightEntryModule;

    const { renderToPipeableStream: renderToPipeableHtmlStream } =
      fizzEntryModule;

    const request = incomingMessageToRequest(req);

    // Vite rewrites the url path. Use the original url to get the correct path.
    if (req.originalUrl) request.url.pathname = req.originalUrl;

    const rscStream = renderToPipeableRscStream(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("script", {
          async: true,
          type: "module",
          src: CLIENT_ENTRY_MODULE_ID,
        }),
        React.createElement(App, { req: request }),
      ),
    );

    if (req.headers.accept?.includes(rscMimeType)) {
      res.statusCode = 200;
      res.setHeader("content-type", rscMimeType);
      rscStream.pipe(res);
      return;
    }

    res.statusCode = 200;
    res.setHeader("content-type", "text/html");
    const htmlStream = renderToPipeableHtmlStream(rscStream);
    htmlStream.pipe(res);
  };
}

const CLIENT_ENTRY_MODULE_ID = "/virtual:react-just/client-entry";
const RESOLVED_CLIENT_ENTRY_MODULE_ID = "\0" + CLIENT_ENTRY_MODULE_ID;

function getClientEntry(rscMimeType: string) {
  return (
    `import "${HMR_PREAMBLE_MODULE_ID}";` +
    `import "${APP_MODULES_MODULE_ID}";` +
    `import "${SERVER_HMR_MODULE_ID}";` +
    getInitializationCode(rscMimeType)
  );
}

const HMR_PREAMBLE_MODULE_ID = "/virtual:react-just/hmr-preamble";
const RESOLVED_HMR_PREAMBLE_MODULE_ID = "\0" + HMR_PREAMBLE_MODULE_ID;

function getHmrPreambleCode() {
  // Taken from: https://github.com/vitejs/vite-plugin-react/blob/main/packages/common/refresh-utils.ts
  return (
    `import { injectIntoGlobalHook } from "/@react-refresh";` +
    `injectIntoGlobalHook(window);` +
    `window.$RefreshReg$ = () => {};` +
    `window.$RefreshSig$ = () => (type) => type;`
  );
}

const APP_MODULES_MODULE_ID = "/virtual:react-just/app-modules";
const RESOLVED_APP_MODULES_MODULE_ID = "\0" + APP_MODULES_MODULE_ID;

function getAppModulesCode(
  clientModulesIds: string[],
  cssModulesIds: string[],
) {
  let code = getModulesRegisteringCodeDevelopment(clientModulesIds);

  for (const cssModuleId of cssModulesIds) {
    code += `import "${cssModuleId}";`;
  }

  return code;
}

const HMR_RELOAD_EVENT = "react-just:reload";
const SERVER_HMR_MODULE_ID = "/virtual:react-just/server-hmr";
const RESOLVED_SERVER_HMR_MODULE_ID = "\0" + SERVER_HMR_MODULE_ID;

function onFlightHotUpdate(server: ViteDevServer) {
  // Invalidate the app modules module to make vite recalculate it on the next
  // request.
  const appModulesModule = server.environments.client.moduleGraph.getModuleById(
    RESOLVED_APP_MODULES_MODULE_ID,
  );

  if (appModulesModule)
    server.environments.client.moduleGraph.invalidateModule(appModulesModule);

  // Send an event to trigger the app modules and react tree reload.
  server.ws.send({
    type: "custom",
    event: HMR_RELOAD_EVENT,
    data: { eventId: crypto.randomUUID() },
  });
}

function getServerHmrCode() {
  return (
    `import { WINDOW_SHARED } from "react-just/client";` +
    `let lastEventId = null;` +
    `import.meta.hot.on("${HMR_RELOAD_EVENT}", ({ eventId }) => {` +
    ` lastEventId = eventId;` +
    ` const { root, rscMimeType } = window[WINDOW_SHARED];` +
    ` const headers = { accept: rscMimeType };` +
    ` createFromFlightFetch(fetch(window.location.href, { headers })).then(async (tree) => {` +
    // Add a timestamp to trigger app modules reload on the browser.
    `   await import(/* @vite-ignore */ \`${APP_MODULES_MODULE_ID}?t=\${Date.now()}\`);` +
    // Avoid race conditions between multiple reloads. Render only the latest one.
    `   if (lastEventId === eventId) root.render(tree);` +
    ` });` +
    `});`
  );
}
