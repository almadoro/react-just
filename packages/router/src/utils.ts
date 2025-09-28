export function removeTrailingSlashes(inputUrl: URL) {
  const url = new URL(inputUrl);
  url.pathname = url.pathname.replace(/\/+$/g, "");
  return url;
}
