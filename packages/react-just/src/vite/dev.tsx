import path from "node:path";
import type {
  Connect,
  PluginOption,
  RunnableDevEnvironment,
  ViteDevServer,
} from "vite";
import {
  renderToFlightPipeableStream,
  renderToHtmlPipeableStream,
} from "../../types/server.node";

type DevOptions = { app: string; flightMimeType: string };

export default function dev(options: DevOptions): PluginOption {
  return {
    name: "react-just:dev",
    apply: "serve",
    configureServer(server) {
      return () =>
        server.middlewares.use(middleware(server, options.flightMimeType));
    },
    resolveId(id) {
      if (id === CLIENT_ENTRY_MODULE_ID) return RESOLVED_CLIENT_ENTRY_MODULE_ID;
      if (id === SERVER_ENTRY_MODULE_ID) return RESOLVED_SERVER_ENTRY_MODULE_ID;
    },
    load(id) {
      if (id === RESOLVED_CLIENT_ENTRY_MODULE_ID) return CLIENT_ENTRY;
      if (id === RESOLVED_SERVER_ENTRY_MODULE_ID)
        return getServerEntry(
          path.resolve(this.environment.config.root, options.app),
        );
    },
  };
}

const CLIENT_ENTRY_MODULE_ID = "/virtual:client-entry";

const RESOLVED_CLIENT_ENTRY_MODULE_ID = "\0" + CLIENT_ENTRY_MODULE_ID;

const HMR_CODE =
  // Taken from: https://github.com/vitejs/vite-plugin-react/blob/main/packages/common/refresh-utils.ts
  `import { injectIntoGlobalHook } from "/@react-refresh";` +
  `injectIntoGlobalHook(window);` +
  `window.$RefreshReg$ = () => {};` +
  `window.$RefreshSig$ = () => (type) => type;`;

const CLIENT_ENTRY =
  HMR_CODE +
  `import { hydrateFromWindowFlight } from "react-just/client";` +
  `hydrateFromWindowFlight();`;

const SERVER_ENTRY_MODULE_ID = "/virtual:server-entry";

const RESOLVED_SERVER_ENTRY_MODULE_ID = "\0" + SERVER_ENTRY_MODULE_ID;

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
        App: React.ComponentType;
      };

    const AppRoot = () => (
      <>
        <script async type="module" src={CLIENT_ENTRY_MODULE_ID} />
        <App />
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

function getServerEntry(appPath: string) {
  return (
    `import { renderToFlightPipeableStream, renderToHtmlPipeableStream } from "react-just/server.node";` +
    `import App from "${path.resolve(appPath)}";` +
    `export { renderToFlightPipeableStream, renderToHtmlPipeableStream, App } `
  );
}
