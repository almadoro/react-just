import { ExpressionStatement, Literal, Node, Program } from "estree";
import { traverse } from "estree-toolkit";

const USE_SERVER_DIRECTIVE = "use server";

/**
 * This is quick check to determine if the module could contain the
 * "use server" directive. Further validation must be done to ensure
 * it actually contains the directive.
 */
export function couldContainUseServerDirective(code: string) {
  return /['"]use server['"]/.test(code);
}

export function getIsUseServerDirective(node: Node) {
  return isDirective(node) && node.expression.value === USE_SERVER_DIRECTIVE;
}

export function getUseServerDirectiveScope(program: Program) {
  let contains = false;

  traverse(program, {
    ExpressionStatement(path) {
      if (path.node && getIsUseServerDirective(path.node)) {
        contains = true;
      }
    },
  });

  if (!contains) return null;

  if (getUseServerModuleDirective(program)) return "module";

  return "function";
}

export function getUseServerModuleDirective(program: Program) {
  // The "use server" directive is at program body level.
  // Can be after other directives but before any other type of node.
  for (const node of program.body) {
    if (getIsUseServerDirective(node)) return node;

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
