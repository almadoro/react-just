import { builders } from "estree-toolkit";
import { TransformationContext } from "./context";

/**
 * Creates an export default declaration node with the following form:
 *
 * ```js
 * export default registerClientReference(
 *   implementationName,
 *   moduleId,
 *   "default"
 * )
 * ```
 */
export function createExportDefaultClientReference(
  implementationName: string,
  context: TransformationContext,
) {
  return builders.exportDefaultDeclaration(
    builders.callExpression(
      builders.identifier(context.registerClientReferenceIdentifier),
      [
        builders.identifier(implementationName),
        builders.literal(context.moduleId),
        builders.literal("default"),
      ],
    ),
  );
}

/**
 * Creates an export named declaration node with the following form:
 *
 * ```js
 * export const exportName = registerClientReference(
 *   implementationName,
 *   moduleId,
 *   exportName
 * )
 * ```
 */
export function createExportNamedClientReference(
  exportName: string,
  implementationName: string,
  context: TransformationContext,
) {
  return builders.exportNamedDeclaration(
    builders.variableDeclaration("const", [
      builders.variableDeclarator(
        builders.identifier(exportName),
        builders.callExpression(
          builders.identifier(context.registerClientReferenceIdentifier),
          [
            builders.identifier(implementationName),
            builders.literal(context.moduleId),
            builders.literal(exportName),
          ],
        ),
      ),
    ]),
  );
}
