import type {
  ClassDeclaration,
  ExportDefaultDeclaration,
  FunctionDeclaration,
} from "estree";
import { builders } from "estree-toolkit";
import type { TransformationContext } from "./context";
import { createExportDefaultClientReference } from "./utils";

/**
 * Transforms exports in the form of:
 * ```ts
 * let a;
 * export default a;
 *
 * export default function b() {}
 *
 * export default [];
 * ```
 *
 * Into:
 * ```ts
 * let __Impl__a;
 * export default registerClientReference(__Impl__a, ...);
 *
 * const __Impl__default__b = ...;
 * export default registerClientReference(__Impl__default__b, ...);
 *
 * const __Impl__default = [];
 * export default registerClientReference(__Impl__default, ...);
 * ```
 */
export default function transformExportDefaultDeclaration(
  node: ExportDefaultDeclaration,
  context: TransformationContext,
) {
  let implementationName: string;

  if (node.declaration.type === "Identifier") {
    // let a;
    // export default a;
    implementationName = context.implementationPrefix + node.declaration.name;

    context.scope.renameBinding(node.declaration.name, implementationName);

    context.program.body.splice(context.program.body.indexOf(node), 1);
  } else if (
    node.declaration.type === "FunctionDeclaration" ||
    node.declaration.type === "ClassDeclaration"
  ) {
    // export default function b() {}
    const originalName = node.declaration.id?.name || "";

    implementationName =
      context.implementationPrefix + "default__" + originalName;

    node.declaration.id = builders.identifier(implementationName);

    context.program.body.splice(
      context.program.body.indexOf(node),
      1,
      // identifier is now defined
      node.declaration as FunctionDeclaration | ClassDeclaration,
    );
  } else {
    // export default [];
    implementationName = context.implementationPrefix + "default";

    context.program.body.splice(
      context.program.body.indexOf(node),
      1,
      builders.variableDeclaration("const", [
        builders.variableDeclarator(
          builders.identifier(implementationName),
          node.declaration,
        ),
      ]),
    );
  }

  context.program.body.push(
    createExportDefaultClientReference(implementationName, context),
  );
}
