import { ExpressionStatement, Literal, Node, Program } from "estree";

const USE_CLIENT_DIRECTIVE = "use client";

/**
 * This is quick check to determine if the module could be a use client
 * module. Further validation must be done to ensure it's actually a use client
 * module with the `getIsUseClientModule` function.
 */
export function couldBeUseClientModule(code: string) {
  return /['"]use client['"]/.test(code);
}

export function getIsUseClientModule(program: Program) {
  return getUseClientDirective(program) !== null;
}

export function getUseClientDirective(program: Program) {
  // The "use client" directive is at program body level.
  // Can be after other directives but before any other type of node.

  for (const node of program.body) {
    if (isDirective(node) && node.expression.value === USE_CLIENT_DIRECTIVE)
      return node;

    if (node.type !== "ExpressionStatement") break;
  }

  return null;
}

function isDirective(
  node: Node,
): node is ExpressionStatement & { expression: Literal } {
  return (
    node.type === "ExpressionStatement" &&
    node.expression.type === "Literal" &&
    typeof node.expression.value === "string"
  );
}
