import { builders } from "estree-toolkit";
import { ENVIRONMENTS } from "../environments";
import { TransformOptions } from "./transform";
import Generator from "./transform/generator";

export function getTransformOptions(options: {
  environment: string;
  moduleId: string;
  minimizeIds: boolean;
}): TransformOptions {
  const { environment, moduleId, minimizeIds } = options;

  switch (environment) {
    case ENVIRONMENTS.CLIENT:
      return {
        generator: new ClientLikeGenerator({
          moduleId,
          registerClientReferenceSource: "react-just/client",
          minimizeIds,
        }),
        treeshakeImplementation: false,
      };
    case ENVIRONMENTS.FIZZ_NODE:
      return {
        generator: new ClientLikeGenerator({
          moduleId,
          registerClientReferenceSource: "react-just/fizz.node",
          minimizeIds,
        }),
        treeshakeImplementation: false,
      };
    case ENVIRONMENTS.FLIGHT_NODE:
      return {
        generator: new FlightGenerator({
          moduleId,
          registerClientReferenceSource: "react-just/flight.node",
          minimizeIds,
        }),
        treeshakeImplementation: true,
      };
    default:
      throw new Error(`Unexpected environment: ${environment}`);
  }
}

class ClientLikeGenerator extends Generator {
  constructor(options: {
    moduleId: string;
    registerClientReferenceSource: string;
    minimizeIds: boolean;
  }) {
    const registerModuleId = options.minimizeIds
      ? getModuleMinizedId(options.moduleId)
      : options.moduleId;

    super({
      getRegisterArguments: ({ exportName, implementationIdentifier }) => {
        const registerExportName = options.minimizeIds
          ? getExportNameMinizedId(exportName)
          : exportName;

        return [
          builders.identifier(implementationIdentifier),
          builders.literal(registerModuleId),
          builders.literal(registerExportName),
        ];
      },
      registerClientReferenceSource: options.registerClientReferenceSource,
    });
  }
}

class FlightGenerator extends Generator {
  constructor(options: {
    moduleId: string;
    registerClientReferenceSource: string;
    minimizeIds: boolean;
  }) {
    const registerModuleId = options.minimizeIds
      ? getModuleMinizedId(options.moduleId)
      : options.moduleId;

    super({
      getRegisterArguments: ({ exportName }) => {
        const registerExportName = options.minimizeIds
          ? getExportNameMinizedId(exportName)
          : exportName;

        return [
          builders.literal(registerModuleId),
          builders.literal(registerExportName),
        ];
      },
      registerClientReferenceSource: options.registerClientReferenceSource,
    });
  }
}

const moduleIdMap = new Map<string, number>();
const exportNameMap = new Map<string, number>();

function getModuleMinizedId(moduleId: string) {
  if (moduleIdMap.has(moduleId)) return moduleIdMap.get(moduleId)!;

  const minizedId = moduleIdMap.size;

  moduleIdMap.set(moduleId, minizedId);

  return minizedId;
}

function getExportNameMinizedId(exportName: string) {
  if (exportNameMap.has(exportName)) return exportNameMap.get(exportName)!;

  const minizedId = exportNameMap.size;

  exportNameMap.set(exportName, minizedId);

  return minizedId;
}
