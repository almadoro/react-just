import { DevEnvironment, Plugin } from "vite";
import { CSS_MODULES } from "./css";
import { ENVIRONMENTS, isFlightEnvironment } from "./environments";
import { CLIENT_MODULES } from "./use-client";

export default function clientHot(): Plugin {
  return {
    name: "react-just:client-hot",
    configureServer(server) {
      watchClientReactChange(server.environments[ENVIRONMENTS.CLIENT]);
    },
    hotUpdate(ctx) {
      if (isFlightEnvironment(this.environment.name))
        onFlightHotUpdate(ctx.server.environments[ENVIRONMENTS.CLIENT]);
    },
    resolveId(id) {
      switch (id) {
        case CLIENT_HOT_MODULES:
          return RESOLVED_CLIENT_HOT_MODULES;
        case BROWSER_HASH_CHECK:
          return RESOLVED_BROWSER_HASH_CHECK;
        case HMR_PREAMBLE:
          return RESOLVED_HMR_PREAMBLE;
        case SERVER_HMR:
          return RESOLVED_SERVER_HMR;
      }
    },
    load(id) {
      switch (id) {
        case RESOLVED_CLIENT_HOT_MODULES:
          return getClientHotModulesCode();
        case RESOLVED_BROWSER_HASH_CHECK:
          if (!(this.environment instanceof DevEnvironment)) return "";
          const browserHash =
            this.environment.depsOptimizer?.metadata.browserHash;
          if (!browserHash)
            throw new Error("Expected browser hash to be available");
          return getBrowserHashCheckCode(browserHash);
        case RESOLVED_HMR_PREAMBLE:
          return getHmrPreambleCode();
        case RESOLVED_SERVER_HMR:
          return getServerHmrCode();
      }
    },
  };
}

const BROWSER_HASH_CHECK_HOT_EVENT = "react-just:browser-hash-check";

function watchClientReactChange(clientEnv: DevEnvironment) {
  let currentBrowserHash = clientEnv.depsOptimizer?.metadata.browserHash;

  // When a reoptimization occurs, the React version of loaded modules on
  // client will not match future loaded ones. A full reload is required.
  setInterval(() => {
    let prevBrowserHash = currentBrowserHash;
    currentBrowserHash = clientEnv.depsOptimizer?.metadata.browserHash;

    const needsReload = prevBrowserHash !== currentBrowserHash;
    if (needsReload) clientEnv.hot.send({ type: "full-reload" });
  }, 0);

  // A reoptimization may occur before the Vite connection is established;
  // thus, any triggered full-reload events won't be received. A manual check
  // is required after the connection is established.
  clientEnv.hot.on("connection", () => {
    // The event is sent to every connected client. This doesn't matter.
    // This event should have no effects when the browser's modules are up to
    // date.
    clientEnv.hot.send({
      type: "custom",
      event: BROWSER_HASH_CHECK_HOT_EVENT,
      data: { browserHash: currentBrowserHash },
    });
  });
}

const TREE_RELOAD_HOT_EVENT = "react-just:tree-reload";

function onFlightHotUpdate(clientEnv: DevEnvironment) {
  // Send an event to trigger the client modules and react tree reload.
  clientEnv.hot.send({
    type: "custom",
    event: TREE_RELOAD_HOT_EVENT,
    data: { eventId: crypto.randomUUID() },
  });
}

export const CLIENT_HOT_MODULES = "/virtual:react-just/client-hot-modules";
const RESOLVED_CLIENT_HOT_MODULES = "\0" + CLIENT_HOT_MODULES;

function getClientHotModulesCode() {
  return (
    `import "${BROWSER_HASH_CHECK}";` +
    `import "${HMR_PREAMBLE}";` +
    `import "${SERVER_HMR}";`
  );
}

const BROWSER_HASH_CHECK = "/virtual:react-just/browser-hash-check";
const RESOLVED_BROWSER_HASH_CHECK = "\0" + BROWSER_HASH_CHECK;

function getBrowserHashCheckCode(currentBrowserHash: string) {
  return (
    `if (import.meta.hot) {` +
    `  import.meta.hot.on("${BROWSER_HASH_CHECK_HOT_EVENT}", ({ browserHash }) => {` +
    `    if (browserHash !== "${currentBrowserHash}")` +
    `      window.location.reload();` +
    `  });` +
    `}`
  );
}

const HMR_PREAMBLE = "/virtual:react-just/hmr-preamble";
const RESOLVED_HMR_PREAMBLE = "\0" + HMR_PREAMBLE;

function getHmrPreambleCode() {
  // Taken from: https://github.com/vitejs/vite-plugin-react/blob/main/packages/common/refresh-utils.ts
  return (
    `import { injectIntoGlobalHook } from "/@react-refresh";` +
    `if (import.meta.hot) {` +
    `  injectIntoGlobalHook(window);` +
    `  window.$RefreshReg$ = () => {};` +
    `  window.$RefreshSig$ = () => (type) => type;` +
    `}`
  );
}

const SERVER_HMR = "/virtual:react-just/server-hmr";
const RESOLVED_SERVER_HMR = "\0" + SERVER_HMR;

function getServerHmrCode() {
  return (
    `import { createFromRscFetch, render, RSC_MIME_TYPE } from "react-just/client";` +
    `if (import.meta.hot) {` +
    `  let lastEventId = null;` +
    `  import.meta.hot.on("${TREE_RELOAD_HOT_EVENT}", ({ eventId }) => {` +
    `    lastEventId = eventId;` +
    `    const headers = { accept: RSC_MIME_TYPE };` +
    // Don't use exactly the same URL as the one we're trying to load to avoid
    // sharing cache between the RSC and the HTML.
    `    const url = new URL(window.location.href);` +
    `    url.searchParams.set("__rsc__", "1");` +
    `    createFromRscFetch(fetch(url, { headers })).then(async (tree) => {` +
    // Add a timestamp to trigger modules reload on the browser.
    `      await import(/* @vite-ignore */ "${CLIENT_MODULES}?t=" + Date.now());` +
    `      await import(/* @vite-ignore */ "${CSS_MODULES}?t=" + Date.now());` +
    // Avoid race conditions between multiple reloads. Render only the latest one.
    `      if (lastEventId === eventId) render(tree);` +
    `    });` +
    `  });` +
    `}`
  );
}
