import { Expression, Node, Program } from "estree";
import { builders } from "estree-toolkit";

export default class Generator {
  constructor(private options: GeneratorOptions) {}

  /**
   * Creates a node with the following structure:
   *
   * ```js
   * import { registerServerReference as $$registerServerReference$$ } from "...";
   * ```
   */
  public createRegisterFunctionImport() {
    return builders.importDeclaration(
      [
        builders.importSpecifier(
          builders.identifier(REGISTER_SERVER_REFERENCE_SOURCE_IDENTIFIER),
          builders.identifier(REGISTER_SERVER_REFERENCE_IDENTIFIER),
        ),
      ],
      builders.literal(this.options.registerServerReferenceSource),
    );
  }

  /**
   * Create nodes with the following structure:
   *
   * ```js
   * const $$Ref$$exportName = $$registerServerReference$$(...);
   * export { $$Ref$$exportName as exportName };
   * ```
   */
  public createRegisterAndExportReference(
    exportName: string,
    implementationIdentifier: string,
  ) {
    const referenceIdentifier = REFERENCE_PREFIX + exportName;

    const callExpression = builders.callExpression(
      builders.identifier(REGISTER_SERVER_REFERENCE_IDENTIFIER),
      this.options.getRegisterArguments({
        exportName,
        implementationIdentifier,
      }),
    );

    return [
      builders.variableDeclaration("const", [
        builders.variableDeclarator(
          builders.identifier(referenceIdentifier),
          callExpression,
        ),
      ]),
      builders.exportNamedDeclaration(null, [
        builders.exportSpecifier(
          builders.identifier(referenceIdentifier),
          builders.identifier(exportName),
        ),
      ]),
    ];
  }

  /**
   * Treeshakes the implementation of the module. Leaves only the necessary
   * code to register the server references.
   */
  public createTreeshakedBody(body: Program["body"]) {
    const newBody: Program["body"] = [];

    for (const node of body) {
      if (
        this.isExportDeclaration(node) ||
        this.isRegisterReferenceDeclaration(node) ||
        this.isRegisterFunctionImport(node)
      ) {
        newBody.push(node);
      }
    }

    return newBody;
  }

  private isExportDeclaration(node: Node) {
    return node.type === "ExportNamedDeclaration";
  }

  private isRegisterReferenceDeclaration(node: Node) {
    if (node.type !== "VariableDeclaration") return false;

    const [declaration] = node.declarations;

    return (
      node.declarations.length === 1 &&
      declaration.type === "VariableDeclarator" &&
      declaration.id.type === "Identifier" &&
      declaration.id.name.startsWith(REFERENCE_PREFIX)
    );
  }

  private isRegisterFunctionImport(node: Node) {
    return (
      node.type === "ImportDeclaration" &&
      node.source.value === this.options.registerServerReferenceSource
    );
  }
}

const REFERENCE_PREFIX = "$$Ref$$";
const REGISTER_SERVER_REFERENCE_IDENTIFIER = "$$registerServerReference$$";
const REGISTER_SERVER_REFERENCE_SOURCE_IDENTIFIER = "registerServerReference";

type GeneratorOptions = {
  /**
   * A function that returns the arguments to be passed to the
   * `registerServerReference` function call.
   */
  getRegisterArguments: GetRegisterArgumentsFn;
  /**
   * The source of the `registerServerReference` function.
   */
  registerServerReferenceSource: string;
};

type GetRegisterArgumentsFn = (ctx: {
  exportName: string;
  implementationIdentifier: string;
}) => Expression[];
