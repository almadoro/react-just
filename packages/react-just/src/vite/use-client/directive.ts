import { Program } from "estree";

const USE_CLIENT_DIRECTIVE = "use client";

export function getUseClientDirective(program: Program) {
  // The "use client" directive must be the first node in the file.
  const firstNode = program.body[0];

  if (
    firstNode &&
    firstNode.type === "ExpressionStatement" &&
    firstNode.expression.type === "Literal" &&
    firstNode.expression.value === USE_CLIENT_DIRECTIVE
  )
    return firstNode;

  return null;
}

export function isUseClientModule(program: Program) {
  return getUseClientDirective(program) !== null;
}
