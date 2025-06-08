import type {
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  ImportSpecifier,
} from "estree";
import { builders } from "estree-toolkit";
import { TransformationContext } from "./context";
import {
  createExportDefaultClientReference,
  createExportNamedClientReference,
} from "./utils";

/**
 * Transforms exports in the form of:
 * ```ts
 * export { a, b as c } from "pkg";
 * ```
 *
 * Into:
 * ```ts
 * import { a as __Impl__a, b as __Impl__c } from "pkg";
 * export const a = registerClientReference(__Impl__a, ...);
 * export const c = registerClientReference(__Impl__c, ...);
 * ```
 */
export default function transformExportNamedFromSource(
  node: ExportNamedDeclaration,
  context: TransformationContext,
) {
  const source = node.source!;

  const imports: ImportSpecifier[] = [];
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
    const implementationName = context.implementationPrefix + exportName;

    imports.push(
      builders.importSpecifier(
        builders.identifier(localName),
        builders.identifier(implementationName),
      ),
    );

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

  const importDeclaration = builders.importDeclaration(imports, source);

  context.program.body.unshift(importDeclaration);

  context.program.body.splice(
    context.program.body.indexOf(node),
    1,
    ...exports,
  );
}
