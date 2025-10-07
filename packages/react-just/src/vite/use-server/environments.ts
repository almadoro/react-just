import { builders } from "estree-toolkit";
import crypto from "node:crypto";
import { ENVIRONMENTS } from "../environments";
import { TransformOptions } from "./transform";
import Generator from "./transform/generator";

export function getTransformOptions(options: {
  environment: string;
  hash: boolean;
  relativePath: string;
}): TransformOptions {
  const { environment, hash, relativePath } = options;

  switch (environment) {
    case ENVIRONMENTS.CLIENT:
      return {
        generator: new ClientLikeGenerator({
          hash,
          relativePath,
          registerServerReferenceSource: "react-just/client",
        }),
        treeshakeImplementation: true,
      };
    case ENVIRONMENTS.FIZZ_NODE:
      return {
        generator: new ClientLikeGenerator({
          hash,
          relativePath,
          registerServerReferenceSource: "react-just/fizz.node",
        }),
        treeshakeImplementation: true,
      };
    case ENVIRONMENTS.FLIGHT_NODE:
      return {
        generator: new FlightGenerator({
          hash,
          relativePath,
          registerServerReferenceSource: "react-just/flight.node",
        }),
        treeshakeImplementation: false,
      };
    case ENVIRONMENTS.SCAN_USE_SERVER_MODULES:
      return {
        generator: new ClientLikeGenerator({
          hash,
          relativePath,
          registerServerReferenceSource: "react-just/client",
        }),
        treeshakeImplementation: true,
      };
    default:
      throw new Error(`Unexpected environment: ${environment}`);
  }
}

class ClientLikeGenerator extends Generator {
  constructor(options: {
    hash: boolean;
    registerServerReferenceSource: string;
    relativePath: string;
  }) {
    super({
      getRegisterArguments: ({ exportName }) => {
        const id = getId(options.relativePath, exportName);
        const registerId = options.hash ? hash(id) : id;
        return [builders.literal(registerId)];
      },
      registerServerReferenceSource: options.registerServerReferenceSource,
    });
  }
}

class FlightGenerator extends Generator {
  constructor(options: {
    hash: boolean;
    registerServerReferenceSource: string;
    relativePath: string;
  }) {
    super({
      getRegisterArguments: ({ implementationIdentifier, exportName }) => {
        const id = getId(options.relativePath, exportName);
        const registerId = options.hash ? hash(id) : id;
        return [
          builders.identifier(implementationIdentifier),
          builders.literal(registerId),
          builders.literal(exportName),
        ];
      },
      registerServerReferenceSource: options.registerServerReferenceSource,
    });
  }
}

function getId(relativePath: string, exportName: string) {
  return `${relativePath}#${exportName}`;
}

function hash(id: string) {
  // Using deterministic ID to avoid actions breaking between
  // deployments.
  return crypto
    .createHash("sha256")
    .update(id)
    .digest()
    .subarray(0, HASH_BYTES)
    .toString("base64url");
}

const HASH_BYTES = 8;
