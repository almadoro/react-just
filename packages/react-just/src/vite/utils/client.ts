export function getInitializationCode(flightMimeType: string) {
  return (
    `import { hydrateFromWindowStream, WINDOW_SHARED } from "react-just/client";` +
    `hydrateFromWindowStream().then(root => {` +
    ` window[WINDOW_SHARED] = { root, rscMimeType: "${flightMimeType}" };` +
    `});`
  );
}
