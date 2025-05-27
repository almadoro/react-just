import path from "node:path";
import type {
  Connect,
  PluginOption,
  RunnableDevEnvironment,
  ViteDevServer,
} from "vite";
import { AppEntryProps } from "../../types/server";
import {
  renderToFlightPipeableStream,
  renderToHtmlPipeableStream,
} from "../../types/server.node";
import { incomingMessageToRequest } from "../server/node/transform";
import { resolveAppEntry } from "./utils/resolve-entry";

type DevOptions = { app?: string; flightMimeType: string };

export default function dev(options: DevOptions): PluginOption {
  let server: ViteDevServer;

  return {
    name: "react-just:dev",
    apply: "serve",
    configureServer(s) {
      server = s;
      return () =>
        server.middlewares.use(middleware(server, options.flightMimeType));
    },
    resolveId(id) {
      if (id === CLIENT_ENTRY_MODULE_ID) return RESOLVED_CLIENT_ENTRY_MODULE_ID;
      if (id === SERVER_ENTRY_MODULE_ID) return RESOLVED_SERVER_ENTRY_MODULE_ID;
    },
    async load(id) {
      if (id === RESOLVED_CLIENT_ENTRY_MODULE_ID)
        // It doesn't matter if we get some client imported css modules.
        // Vite will automatically dedupe them.
        return getClientEntry(getServerCssModulesUrls(server));
      if (id === RESOLVED_SERVER_ENTRY_MODULE_ID)
        return getServerEntry(
          await resolveAppEntry(this.environment.config.root, options.app),
        );
    },
  };
}

type RenderToHtmlPipeableStream = typeof renderToHtmlPipeableStream;
type RenderToFlightPipeableStream = typeof renderToFlightPipeableStream;

function middleware(
  server: ViteDevServer,
  flightMimeType: string,
): Connect.NextHandleFunction {
  return async (req, res) => {
    const ssr = server.environments.ssr as RunnableDevEnvironment;

    const serverModule = await ssr.runner.import(SERVER_ENTRY_MODULE_ID);

    const { renderToFlightPipeableStream, renderToHtmlPipeableStream, App } =
      serverModule as {
        renderToFlightPipeableStream: RenderToFlightPipeableStream;
        renderToHtmlPipeableStream: RenderToHtmlPipeableStream;
        App: React.ComponentType<AppEntryProps>;
      };

    const request = incomingMessageToRequest(req);

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

// Taken from: https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts#L92
const CSS_EXTENSIONS_RE =
  /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)($|\?)/;

function getServerCssModulesUrls(server: ViteDevServer) {
  const { urlToModuleMap } = server.environments.ssr.moduleGraph;

  const urls = [...urlToModuleMap.keys()];

  const cssModulesUrls = urls.filter((url) => CSS_EXTENSIONS_RE.test(url));

  return cssModulesUrls;
}

const CLIENT_ENTRY_MODULE_ID = "/virtual:client-entry";
const RESOLVED_CLIENT_ENTRY_MODULE_ID = "\0" + CLIENT_ENTRY_MODULE_ID;

function getClientEntry(cssModulesUrls: string[]) {
  // Taken from: https://github.com/vitejs/vite-plugin-react/blob/main/packages/common/refresh-utils.ts
  const HMR_CODE =
    `import { injectIntoGlobalHook } from "/@react-refresh";` +
    `injectIntoGlobalHook(window);` +
    `window.$RefreshReg$ = () => {};` +
    `window.$RefreshSig$ = () => (type) => type;`;

  let code =
    HMR_CODE +
    `import { hydrateFromWindowFlight } from "react-just/client";` +
    `hydrateFromWindowFlight();`;

  for (const cssModuleUrl of cssModulesUrls) {
    code += `import "${cssModuleUrl}";`;
  }

  return code;
}

const SERVER_ENTRY_MODULE_ID = "/virtual:server-entry";
const RESOLVED_SERVER_ENTRY_MODULE_ID = "\0" + SERVER_ENTRY_MODULE_ID;

function getServerEntry(appPath: string) {
  return (
    `import { renderToFlightPipeableStream, renderToHtmlPipeableStream } from "react-just/server.node";` +
    `import App from "${path.resolve(appPath)}";` +
    `export { renderToFlightPipeableStream, renderToHtmlPipeableStream, App } `
  );
}
