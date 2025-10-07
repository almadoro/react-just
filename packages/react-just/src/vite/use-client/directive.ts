import { Program } from "estree";

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
