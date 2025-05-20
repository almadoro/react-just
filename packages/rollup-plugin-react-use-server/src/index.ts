import type {
  ArrowFunctionExpression,
  FunctionDeclaration,
  FunctionExpression,
  Node,
} from "estree";
import { NodePath, traverse } from "estree-toolkit";
import type { Plugin } from "rollup";

export default function reactUseServer() {
  return {
    name: "react-use-server",
    async transform(code, id) {
      if (!EXTENSIONS.some((ext) => id.endsWith(ext))) return;

      const ast = this.parse(code);

      traverse(ast, {
        Program(path) {
          // The directive "use server" directive can appear at the top
          // of a module.
          const firstNode = path.node!.body[0];

          const isUseServerDirective = getIsUseServerDirective(firstNode);

          if (!isUseServerDirective) return;

          throw new Error(
            "use server directive at the top of a module not supported yet",
          );
        },
        ArrowFunctionExpression: FunctionLike,
        FunctionDeclaration: FunctionLike,
        FunctionExpression: FunctionLike,
      });

      return code;
    },
  } satisfies Plugin;
}

// prettier-ignore
const EXTENSIONS = [
  ".js", ".jsx", ".mjs", ".cjs",
  ".ts", ".tsx", ".mts", ".cts",
];

const USE_SERVER_DIRECTIVE = "use server";

function FunctionLike(
  path: NodePath<
    FunctionDeclaration | FunctionExpression | ArrowFunctionExpression
  >,
) {
  // The directive "use server" directive can appear at the top of a function.

  const node = path.node!;

  if (node.body.type !== "BlockStatement") return;

  const firstBlockNode = node.body.body[0];

  const isUseServerDirective = getIsUseServerDirective(firstBlockNode);

  if (!isUseServerDirective) return;

  const async = node.async;

  if (!async) throw new Error("server functions must be async");

  throw new Error("use server directive inside functions not supported yet");
}

function getIsUseServerDirective(node: Node) {
  return (
    node &&
    node.type === "ExpressionStatement" &&
    node.expression.type === "Literal" &&
    node.expression.value === USE_SERVER_DIRECTIVE
  );
}
