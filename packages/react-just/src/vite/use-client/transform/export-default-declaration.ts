import {
  ClassDeclaration,
  ExportDefaultDeclaration,
  FunctionDeclaration,
} from "estree";
import { builders } from "estree-toolkit";
import { Program } from "./program";

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
 * let a;
 * const $$Ref$$default = $$registerClientReference$$(...);
 * export { $$Ref$$default as default };
 *
 * function b() {}
 * const $$Ref$$default = $$registerClientReference$$(...);
 * export { $$Ref$$default as default };
 *
 * const $$default$$ = [];
 * const $$Ref$$default = $$registerClientReference$$(...);
 * export { $$Ref$$default as default };
 * ```
 */
export default function transformExportDefaultDeclaration(
  node: ExportDefaultDeclaration,
  program: Program,
) {
  let implementationIdentifier: string;

  if (node.declaration.type === "Identifier") {
    // let a;
    // export default a;
    implementationIdentifier = node.declaration.name;

    program.removeExport(node);
  } else if (
    node.declaration.type === "FunctionDeclaration" ||
    node.declaration.type === "ClassDeclaration"
  ) {
    // export default function b() {}
    if (!node.declaration.id)
      node.declaration.id = builders.identifier("$$default$$");

    implementationIdentifier = node.declaration.id.name;

    program.replaceExportWithDeclaration(
      node,
      node.declaration as FunctionDeclaration | ClassDeclaration, // identifier is now defined
    );
  } else {
    // export default [];
    implementationIdentifier = "$$default$$";

    const variableDeclaration = builders.variableDeclaration("const", [
      builders.variableDeclarator(
        builders.identifier(implementationIdentifier),
        node.declaration,
      ),
    ]);

    program.replaceExportWithDeclaration(node, variableDeclaration);
  }

  program.registerClientReference("default", implementationIdentifier);
}
