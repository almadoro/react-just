import { Directive, ModuleDeclaration, Program, Statement } from "estree";

export default class Module {
  constructor(private program: Program) {}

  public append(...nodes: BodyNode[]) {
    this.program.body.push(...nodes);
  }

  public remove(node: BodyNode) {
    this.program.body.splice(this.program.body.indexOf(node), 1);
  }

  public replace(node: BodyNode, newNode: BodyNode) {
    this.program.body.splice(this.program.body.indexOf(node), 1, newNode);
  }

  public unshift(...nodes: BodyNode[]) {
    this.program.body.unshift(...nodes);
  }
}

type BodyNode = Statement | Directive | ModuleDeclaration;
