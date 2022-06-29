import path from "path";
import ts from "typescript";
import { beforeCompile } from "../src";
import * as fs from "fs";

function reportAfterCompilationDiagnostic(
  program: ts.EmitAndSemanticDiagnosticsBuilderProgram,
  emitResult: ts.EmitResult,
  formatHost: ts.FormatDiagnosticsHost
): number {
  const diagnostics = ts
    .getPreEmitDiagnostics(program as unknown as ts.Program)
    .concat(emitResult.diagnostics);

  if (diagnostics.length > 0) {
    console.error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost)
    );
    console.info(`Found ${diagnostics.length} error(s).` + ts.sys.newLine);
  }
  return diagnostics.length;
}

function compile() {
  const formatHost: ts.FormatDiagnosticsHost = {
    getCanonicalFileName: (path) => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
  };

  const parsedCmd = ts.getParsedCommandLineOfConfigFile(
    path.join(process.cwd(), "tsconfig.json"),
    undefined,
    ts.sys as unknown as ts.ParseConfigFileHost
  );
  if (!parsedCmd) {
    throw new Error("failed");
  }
  const { options, fileNames, projectReferences } = parsedCmd;

  const buildProgram = ts.createIncrementalProgram({
    rootNames: fileNames,
    projectReferences,
    options: options,
  });

  const program = buildProgram.getProgram();
  const emitResult = buildProgram.emit(
    undefined,
    undefined,
    undefined,
    undefined,
    {
      before: [beforeCompile(program)],
    }
  );

  const errorsCount = reportAfterCompilationDiagnostic(
    program as any,
    emitResult,
    formatHost
  );
  return !errorsCount;
}

process.chdir("test/compiler");
try {
  compile();
} finally {
  process.chdir("../..");
}
