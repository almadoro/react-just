import { createHash } from "node:crypto";
import path from "node:path";

export function getRegisterModuleIdFromPath(filePath: string) {
  // Use a hash of the relative path to the project root as the module id.
  // This ensures that the module id is consistent across builds.
  const relativePath = path.relative(process.cwd(), filePath);
  const hash = createHash("sha256").update(relativePath).digest("base64url");
  return hash;
}
