import { createHash } from "node:crypto";
import path from "node:path";
import type { EnvironmentModuleNode } from "vite";

export function getReactModulesRegisteringCode(
  modules: EnvironmentModuleNode[],
) {
  let code = `import { registerModule } from "react-just/client";`;

  for (let i = 0; i < modules.length; i++) {
    const module = modules[i];
    code += `import * as  __entry__${i} from "${module.url}";`;
    code += `registerModule("${module.id}", __entry__${i});`;
  }

  return code;
}

export function getRegisterModuleIdFromPath(filePath: string) {
  // Use a hash of the relative path to the project root as the module id.
  // This ensures that the module id is consistent across builds.
  const relativePath = path.relative(process.cwd(), filePath);
  const hash = createHash("sha256").update(relativePath).digest("base64url");
  return hash;
}
