import type { ExportNamedDeclaration } from "estree";
import { TransformationContext } from "./context";
import { createExportNamedClientReference } from "./utils";

/**
 * Transforms exports in the form of:
 * ```ts
 * let a;
 * let b;
 * export { a, b as c };
 * ```
 *
 * Into:
 * ```ts
 * let __Impl__a;
 * let __Impl__b;
 * export const a = registerClientReference(__Impl__a, ...);
 * export const c = registerClientReference(__Impl__b, ...);
 * ```
 */
export default function transformExportNamedSpecifiers(
  node: ExportNamedDeclaration,
  context: TransformationContext,
) {
  const exports: ExportNamedDeclaration[] = [];

  for (const specifier of node.specifiers) {
    if (
      specifier.local.type !== "Identifier" ||
      specifier.exported.type !== "Identifier"
    )
      /* c8 ignore next */
      continue;

    const localName = specifier.local.name;
    const exportName = specifier.exported.name;

    let implementationName: string;

    if (localName === exportName) {
      implementationName = context.implementationPrefix + exportName;

      context.scope.renameBinding(localName, implementationName);
    } else {
      implementationName = localName;
    }

    exports.push(
      createExportNamedClientReference(exportName, implementationName, context),
    );
  }

  context.program.body.splice(
    context.program.body.indexOf(node),
    1,
    ...exports,
  );
}
