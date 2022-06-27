import ts from "typescript";

type ClassMetadata = Record<string, ts.ObjectLiteralExpression>;

export function beforeCompile(program: ts.Program) {
  return (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sf: ts.SourceFile) => {
      const propertyNodeVisitorFactory =
        (metadata: ClassMetadata) =>
        (node: ts.Node): ts.Node => {
          if (ts.isPropertyDeclaration(node)) {
            const isPropertyStatic = (node.modifiers || []).some(
              (modifier: ts.Modifier) =>
                modifier.kind === ts.SyntaxKind.StaticKeyword
            );
            if (isPropertyStatic) {
              return node;
            }
            // TODO
            return node;
          }
          return node;
        };

      const visitNode = (node: ts.Node): ts.Node => {
        if (ts.isClassDeclaration(node)) {
          const metadata: ClassMetadata = {};
          node = ts.visitEachChild(
            node,
            propertyNodeVisitorFactory(metadata),
            ctx
          );
          return node;
        }
        return ts.visitEachChild(node, visitNode, ctx);
      };
      return ts.visitNode(sf, visitNode);
    };
  };
}
