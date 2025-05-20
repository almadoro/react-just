import { registerClientReference as baseRegisterClientReference } from "react-server-dom/server.node";
import { registerModuleExport } from "./modules";

export default function registerClientReference(
  proxyImplementation: unknown,
  id: string,
  exportName: string,
) {
  registerModuleExport(id, exportName, proxyImplementation);
  return baseRegisterClientReference(proxyImplementation, id, exportName);
}
