import fs from "node:fs/promises";
import path from "node:path";

export async function getAppEntryPath(root: string, app?: string) {
  if (app) return path.resolve(root, app);

  for (const entryPath of APP_ENTRY_PATHS) {
    const entry = path.resolve(root, entryPath);
    try {
      await fs.access(entry, fs.constants.F_OK);
      return entry;
    } catch {}
  }

  throw new Error(
    `App entry not found. Specify the entry path with the "app" option or ` +
      `create a file named one of the following: ${APP_ENTRY_PATHS.join(", ")}`,
  );
}

const APP_ENTRY_PATHS = [
  "src/index.tsx",
  "src/index.jsx",
  "src/index.ts",
  "src/index.js",
];
