import spawn from "cross-spawn";
import path from "path";
import fs from "fs";
import ts from "typescript";
import { HALSP_CLI_PLUGIN_TRANSFORMER } from "../src";

describe("transformer", () => {
  async function expectCode(text: string) {
    text = text.replace("V()", "");
    text = text.replace("V()", "");
    text = text.replace("V()", "");

    expect(text.includes("V()")).toBeTruthy();
  }

  it("should build and replace @V to @V()", async () => {
    spawn.sync("npx", ["halsp", "build", "--cleanDist"], {
      cwd: path.join(__dirname, "./transformer-test"),
      stdio: "inherit",
      encoding: "utf-8",
    });

    const text = await fs.promises.readFile(
      "./test/transformer-test/dist/index.js",
      "utf-8",
    );
    await expectCode(text);
  }, 200000);

  it("should replace @V to @V() by transformer", async () => {
    const code = await fs.promises.readFile(
      "./test/transformer-test/src/index.ts",
      "utf-8",
    );
    const { outputText } = ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.ES2022,
        target: ts.ScriptTarget.ES2022,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
      },
      transformers: HALSP_CLI_PLUGIN_TRANSFORMER(),
      fileName: "index.ts",
    });
    await expectCode(outputText);
  }, 100000);
});
