import { builders } from "estree-toolkit";
import { ENVIRONMENTS } from "../environments";
import { TransformOptions } from "./transform";
import Generator from "./transform/generator";

export function getTransformOptions(
  environment: string,
  moduleId: string,
): TransformOptions {
  switch (environment) {
    case ENVIRONMENTS.CLIENT:
      return {
        generator: new Generator({
          getRegisterArguments: ({ exportName, implementationIdentifier }) => [
            builders.identifier(implementationIdentifier),
            builders.literal(moduleId),
            builders.literal(exportName),
          ],
          registerClientReferenceSource: "react-just/client",
        }),
        treeshakeImplementation: false,
      };
    case ENVIRONMENTS.FIZZ_NODE:
      return {
        generator: new Generator({
          getRegisterArguments: ({ exportName, implementationIdentifier }) => [
            builders.identifier(implementationIdentifier),
            builders.literal(moduleId),
            builders.literal(exportName),
          ],
          registerClientReferenceSource: "react-just/fizz.node",
        }),
        treeshakeImplementation: false,
      };
    case ENVIRONMENTS.FLIGHT_NODE:
      return {
        generator: new Generator({
          getRegisterArguments: ({ exportName }) => [
            builders.literal(moduleId),
            builders.literal(exportName),
          ],
          registerClientReferenceSource: "react-just/flight.node",
        }),
        treeshakeImplementation: true,
      };
    default:
      throw new Error(`Unexpected environment: ${environment}`);
  }
}
