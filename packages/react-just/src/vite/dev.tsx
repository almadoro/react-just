import type {
  Connect,
  DevEnvironment,
  Plugin,
  RunnableDevEnvironment,
  ViteDevServer,
} from "vite";
import { AppEntryProps } from "../../types/server";
import {
  renderToFlightPipeableStream,
  renderToHtmlPipeableStream,
} from "../../types/server.node";
import { incomingMessageToRequest } from "../server/node/transform";
import {
  getInitializationCode,
  getModulesRegisteringCodeDevelopment,
} from "./utils/client";
import { getAppEntryPath } from "./utils/server";

type DevOptions = { app?: string; flightMimeType: string };

export default function dev(options: DevOptions): Plugin {
  let clientModulesIds: string[] = [];
  let cssModulesIds: string[] = [];

  return {
    name: "react-just:dev",
    apply: "serve",
    configureServer(server) {
      return () =>
        server.middlewares.use(async (...args) => {
          const ssrEnv = server.environments.ssr as RunnableDevEnvironment;
          const serverEntryModule = await ssrEnv.runner.import(
            SERVER_ENTRY_MODULE_ID,
          );
          // Once we have loaded the latest server entry module we can extract
          // the client modules and css referenced modules.
          clientModulesIds = getClientModulesIds(ssrEnv);
          cssModulesIds = getCssModulesIds(ssrEnv);
          serveApp(serverEntryModule, options.flightMimeType)(...args);
        });
    },
    resolveId(id) {
      switch (id) {
        case SERVER_ENTRY_MODULE_ID:
          return RESOLVED_SERVER_ENTRY_MODULE_ID;
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
        case RESOLVED_SERVER_ENTRY_MODULE_ID:
          return getServerEntry(
            await getAppEntryPath(this.environment.config.root, options.app),
          );
        case RESOLVED_CLIENT_ENTRY_MODULE_ID:
          return getClientEntry(options.flightMimeType);
        case RESOLVED_HMR_PREAMBLE_MODULE_ID:
          return getHmrPreambleCode();
        case RESOLVED_APP_MODULES_MODULE_ID:
          return getAppModulesCode(clientModulesIds, cssModulesIds);
        case RESOLVED_SERVER_HMR_MODULE_ID:
          return getServerHmrCode();
      }
    },
    hotUpdate(ctx) {
      if (this.environment.name === "ssr") onSsrHotUpdate(ctx.server);
    },
  };
}

const SERVER_ENTRY_MODULE_ID = "/virtual:react-just/server-entry";
const RESOLVED_SERVER_ENTRY_MODULE_ID = "\0" + SERVER_ENTRY_MODULE_ID;

function getServerEntry(appUrl: string) {
  // Render functions and App entry must be imported together to share modules
  // registering.
  return (
    `import { renderToFlightPipeableStream, renderToHtmlPipeableStream } from "react-just/server.node";` +
    `import App from "${appUrl}";` +
    `export { renderToFlightPipeableStream, renderToHtmlPipeableStream, App } `
  );
}

// Taken from: https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts#L92
const CSS_EXTENSIONS_RE =
  /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)($|\?)/;

function getCssModulesIds(ssrEnv: DevEnvironment) {
  // Some css modules are imported by client modules too. This doesn't matter
  // because Vite will automatically dedupe them.
  const { idToModuleMap } = ssrEnv.moduleGraph;

  const cssModulesIds: string[] = [];

  for (const id of idToModuleMap.keys()) {
    if (CSS_EXTENSIONS_RE.test(id)) cssModulesIds.push(id);
  }

  return cssModulesIds;
}

function getClientModulesIds(ssrEnv: DevEnvironment) {
  const { idToModuleMap } = ssrEnv.moduleGraph;

  const clientModulesIds: string[] = [];

  for (const id of idToModuleMap.keys()) {
    const meta = ssrEnv.pluginContainer.getModuleInfo(id)?.meta;
    if (meta?.reactUseClient?.transformed) clientModulesIds.push(id);
  }

  return clientModulesIds;
}

type ServerEntryModule = {
  renderToFlightPipeableStream: typeof renderToFlightPipeableStream;
  renderToHtmlPipeableStream: typeof renderToHtmlPipeableStream;
  App: React.ComponentType<AppEntryProps>;
};

function serveApp(
  serverEntryModule: ServerEntryModule,
  flightMimeType: string,
): Connect.NextHandleFunction {
  return async (req, res) => {
    const { renderToFlightPipeableStream, renderToHtmlPipeableStream, App } =
      serverEntryModule;

    const request = incomingMessageToRequest(req);

    // Vite rewrites the url path. Use the original url to get the correct path.
    if (req.originalUrl) request.url.pathname = req.originalUrl;

    const AppRoot = () => (
      <>
        <script async type="module" src={CLIENT_ENTRY_MODULE_ID} />
        <App req={request} />
      </>
    );

    if (req.headers.accept?.includes(flightMimeType)) {
      res.statusCode = 200;
      res.setHeader("content-type", flightMimeType);
      const flightStream = renderToFlightPipeableStream(<AppRoot />);
      flightStream.pipe(res);
      return;
    }

    res.statusCode = 200;
    res.setHeader("content-type", "text/html");
    const htmlStream = renderToHtmlPipeableStream(<AppRoot />);
    htmlStream.pipe(res);
  };
}

const CLIENT_ENTRY_MODULE_ID = "/virtual:react-just/client-entry";
const RESOLVED_CLIENT_ENTRY_MODULE_ID = "\0" + CLIENT_ENTRY_MODULE_ID;

function getClientEntry(flightMimeType: string) {
  return (
    `import "${HMR_PREAMBLE_MODULE_ID}";` +
    `import "${APP_MODULES_MODULE_ID}";` +
    `import "${SERVER_HMR_MODULE_ID}";` +
    getInitializationCode(flightMimeType)
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

function onSsrHotUpdate(server: ViteDevServer) {
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
