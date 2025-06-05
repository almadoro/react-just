import type { ExportDefaultDeclaration, ExportNamedDeclaration } from "estree";
import { TransformationContext } from "./context";
import {
  createExportDefaultClientReference,
  createExportNamedClientReference,
} from "./utils";

/**
 * Transforms exports in the form of:
 * ```ts
 * let a;
 * let b;
 * let d;
 * export { a, b as c, d as default };
 * ```
 *
 * Into:
 * ```ts
 * let __Impl__a;
 * let b;
 * let d;
 * export const a = registerClientReference(__Impl__a, ...);
 * export const c = registerClientReference(b, ...);
 * export default registerClientReference(d, ...);
 * ```
 */
export default function transformExportNamedSpecifiers(
  node: ExportNamedDeclaration,
  context: TransformationContext,
) {
  const exports: (ExportNamedDeclaration | ExportDefaultDeclaration)[] = [];

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

    if (exportName === "default") {
      exports.push(
        createExportDefaultClientReference(implementationName, context),
      );
    } else {
      exports.push(
        createExportNamedClientReference(
          exportName,
          implementationName,
          context,
        ),
      );
    }
  }

  context.program.body.splice(
    context.program.body.indexOf(node),
    1,
    ...exports,
  );
}
