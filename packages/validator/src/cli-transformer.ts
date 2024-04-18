import type ts from "typescript";

export function HALSP_CLI_PLUGIN_TRANSFORMER(): ts.CustomTransformers {
  return {
    before: [transormer],
  };
}

const transormer: ts.TransformerFactory<ts.SourceFile> = (context) => {
  const tsc = _require("typescript") as typeof ts;

  const visitDecoratorExpression = (node: ts.Node) => {
    return tsc.visitEachChild(
      node,
      (node) => {
        if (tsc.isIdentifier(node) && node.text == "V") {
          return tsc.factory.createCallExpression(
            tsc.factory.createIdentifier("V"),
            undefined,
            [],
          );
        } else if (tsc.isCallExpression(node)) {
          return tsc.visitEachChild(node, visitDecoratorExpression, context);
        }
        return tsc.visitEachChild(node, visit, context);
      },
      context,
    );
  };

  const visitDecorator = (node: ts.Node) => {
    if (tsc.isIdentifier(node) && node.text == "V") {
      return tsc.factory.createCallExpression(
        tsc.factory.createIdentifier("V"),
        undefined,
        [],
      );
    } else if (tsc.isDecorator(node)) {
      return tsc.visitEachChild(node, visitDecorator, context);
    } else if (tsc.isCallExpression(node)) {
      return tsc.visitEachChild(node, visitDecoratorExpression, context);
    }
    return tsc.visitEachChild(node, visit, context);
  };

  const visit = (node: ts.Node) => {
    try {
      if (
        (tsc.isDecorator(node) && node.getText() == "@V") ||
        node.getText().startsWith("@V.")
      ) {
        return tsc.visitEachChild(node, visitDecorator, context);
      }
    } catch {}

    return tsc.visitEachChild(node, visit, context);
  };

  return ((node) =>
    tsc.visitNode(node, visit)) as ts.Transformer<ts.SourceFile>;
};
