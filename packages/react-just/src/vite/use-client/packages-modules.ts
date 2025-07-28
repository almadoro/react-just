// Packages modules can't be directly imported on development because Vite
// won't resolve dependencies to their optimized versions (e.g., react and
// react-dom); thus, untransformed commonjs files may be referenced. They
// can only be used as an optimized dependency. Also, using an optimized
// package avoids network congestion on the browser on development.

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export const PACKAGES_CLIENT_MODULES =
  "node_modules/.react-just/packages-client-modules";

const PACKAGES_CLIENT_MODULES_DIR = path.resolve(PACKAGES_CLIENT_MODULES);
const PACKAGES_CLIENT_MODULES_PACKAGE_JSON = path.resolve(
  PACKAGES_CLIENT_MODULES_DIR,
  "package.json",
);
const MAIN_FILE_NAME = "index.js";
const PACKAGES_CLIENT_MODULES_MAIN = path.resolve(
  PACKAGES_CLIENT_MODULES_DIR,
  MAIN_FILE_NAME,
);

export async function initPackagesClientModules() {
  let packageJsonExists: boolean;

  try {
    await fs.access(PACKAGES_CLIENT_MODULES_PACKAGE_JSON, fs.constants.F_OK);
    packageJsonExists = true;
  } catch {
    packageJsonExists = false;
  }

  let mainExists: boolean;

  try {
    await fs.access(PACKAGES_CLIENT_MODULES_MAIN, fs.constants.F_OK);
    mainExists = true;
  } catch {
    mainExists = false;
  }

  const initialized = packageJsonExists && mainExists;

  if (!initialized) await writePackagesClientModules([]);
}

export async function writePackagesClientModules(moduleIds: string[]) {
  await fs.mkdir(PACKAGES_CLIENT_MODULES_DIR, { recursive: true });

  let code = "export {};";

  // Sort ids to generate consistent hash
  for (const id of [...moduleIds].sort()) {
    code += `import "${id}";`;
  }

  const hash = crypto.createHash("sha256").update(code).digest("hex");

  await fs.writeFile(PACKAGES_CLIENT_MODULES_MAIN, code);

  const packageJson = {
    type: "module",
    main: MAIN_FILE_NAME,
    // Write a hash that changes with the content of the package to generate
    // different hash on next optimization metadata.
    hash,
  };

  await fs.writeFile(
    PACKAGES_CLIENT_MODULES_PACKAGE_JSON,
    JSON.stringify(packageJson, null, 2),
  );
}
