import { parseAstAsync, transformWithEsbuild } from "vite";

export default async function parse(
  code: string,
  id: string,
  options?: { jsxDev: boolean },
) {
  const shouldTransform = /\.(jsx|ts|tsx|mts)/.test(id);

  if (shouldTransform) {
    const { code: transformedCode } = await transformWithEsbuild(code, id, {
      jsx: "automatic",
      jsxImportSource: "react",
      jsxDev: options?.jsxDev,
    });

    return parseAstAsync(transformedCode);
  }

  return parseAstAsync(code);
}
