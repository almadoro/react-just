import { builders } from "estree-toolkit";
import { TransformationContext } from "./context";

/**
 * Creates a variable declaration node with the following form:
 *
 * ```js
 * const variable = registerClientReference(implementation, moduleId, exportName);
 * ```
 */
export function createClientReferenceDeclaration(
  identifiers: { reference: string; implementation: string },
  exportName: string,
  context: TransformationContext,
) {
  return builders.variableDeclaration("const", [
    builders.variableDeclarator(
      builders.identifier(identifiers.reference),
      builders.callExpression(
        builders.identifier(context.registerClientReferenceIdentifier),
        [
          builders.identifier(identifiers.implementation),
          builders.literal(context.moduleId),
          builders.literal(exportName),
        ],
      ),
    ),
  ]);
}
