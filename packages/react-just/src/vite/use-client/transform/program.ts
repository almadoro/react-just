import {
  Declaration,
  Program as EstreeProgram,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  Expression,
  ImportSpecifier,
  Literal,
  Node,
} from "estree";
import { builders } from "estree-toolkit";

export type ProgramOptions = {
  /**
   * A function that returns the arguments to be passed to the
   * `registerClientReference` function call.
   */
  getRegisterArguments: GetRegisterArgumentsFn;
  /**
   * The source of the `registerClientReference` function import.
   */
  registerClientReferenceSource: string;
};

type GetRegisterArgumentsFn = (context: {
  exportName: string;
  implementationIdentifier: string;
}) => Expression[];

export class Program {
  constructor(
    private readonly program: EstreeProgram,
    private readonly options: ProgramOptions,
  ) {}

  public addImportDeclaration(specifiers: ImportSpecifier[], source: Literal) {
    const importDeclaration = builders.importDeclaration(specifiers, source);
    this.program.body.unshift(importDeclaration);
  }

  public addRegisterClientReferenceImport() {
    this.addImportDeclaration(
      [
        builders.importSpecifier(
          builders.identifier(REGISTER_CLIENT_REFERENCE_SOURCE_IDENTIFIER),
          builders.identifier(REGISTER_CLIENT_REFERENCE_IDENTIFIER),
        ),
      ],
      builders.literal(this.options.registerClientReferenceSource),
    );
  }

  public getUseClientDirective() {
    // The "use client" directive must be the first node in the file.
    const firstNode = this.program.body[0];

    if (
      firstNode &&
      firstNode.type === "ExpressionStatement" &&
      firstNode.expression.type === "Literal" &&
      firstNode.expression.value === USE_CLIENT_DIRECTIVE
    )
      return firstNode;

    return null;
  }

  /**
   * Appends a code in the form of:
   *
   * ```js
   * const $$Ref$$exportName = $$registerClientReference$$(...);
   * export { $$Ref$$exportName as exportName };
   * ```
   */
  public registerClientReference(
    exportName: string,
    implementationIdentifier: string,
  ) {
    const referenceIdentifier = REFERENCE_PREFIX + exportName;

    this.program.body.push(
      builders.variableDeclaration("const", [
        builders.variableDeclarator(
          builders.identifier(referenceIdentifier),
          builders.callExpression(
            builders.identifier(REGISTER_CLIENT_REFERENCE_IDENTIFIER),
            this.options.getRegisterArguments({
              exportName,
              implementationIdentifier,
            }),
          ),
        ),
      ]),
      builders.exportNamedDeclaration(null, [
        builders.exportSpecifier(
          builders.identifier(referenceIdentifier),
          builders.identifier(exportName),
        ),
      ]),
    );
  }

  public removeExport(node: ExportDeclaration) {
    this.program.body.splice(this.program.body.indexOf(node), 1);
  }

  public removeUseClientDirective() {
    this.program.body.splice(
      this.program.body.indexOf(this.getUseClientDirective()!),
      1,
    );
  }

  public replaceExportWithDeclaration(
    node: ExportDeclaration,
    declaration: Declaration,
  ) {
    this.program.body.splice(this.program.body.indexOf(node), 1, declaration);
  }

  /**
   * Treeshakes the implementation of the module. Leaves only the exports, the
   * register client reference calls, and the import of the register client
   * reference.
   */
  public treeshakeImplementation() {
    const newBody: EstreeProgram["body"] = [];

    for (const node of this.program.body) {
      if (
        this.isExportDeclaration(node) ||
        this.isRegisterClientReferenceDeclaration(node) ||
        this.isRegisterClientReferenceImport(node)
      ) {
        newBody.push(node);
      }
    }

    this.program.body = newBody;
  }

  private isExportDeclaration(node: Node) {
    return (
      node.type === "ExportNamedDeclaration" ||
      node.type === "ExportDefaultDeclaration"
    );
  }

  private isRegisterClientReferenceDeclaration(node: Node) {
    if (node.type !== "VariableDeclaration") return false;

    const [declaration] = node.declarations;

    return (
      node.declarations.length === 1 &&
      declaration.type === "VariableDeclarator" &&
      declaration.id.type === "Identifier" &&
      declaration.id.name.startsWith(REFERENCE_PREFIX)
    );
  }

  private isRegisterClientReferenceImport(node: Node) {
    return (
      node.type === "ImportDeclaration" &&
      node.source.value === this.options.registerClientReferenceSource
    );
  }
}

type ExportDeclaration = ExportNamedDeclaration | ExportDefaultDeclaration;

const REFERENCE_PREFIX = "$$Ref$$";
const REGISTER_CLIENT_REFERENCE_SOURCE_IDENTIFIER = "registerClientReference";
const REGISTER_CLIENT_REFERENCE_IDENTIFIER = "$$registerClientReference$$";
const USE_CLIENT_DIRECTIVE = "use client";
