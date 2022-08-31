import { MapItem } from "@ipare/router";
import { OpenApiBuilder } from "openapi3-ts";
import { Parser } from "../src/parser";

test("decorators", async () => {
  const builder = new OpenApiBuilder();
  process.chdir("test/parser");
  try {
    new Parser(
      [new MapItem("decorator.ts", "TestDecorator", "test", ["post"])],
      builder,
      {
        dir: ".",
      }
    ).parse();
  } finally {
    process.chdir("../..");
  }
  const doc = builder.getSpec();
  expect(
    Object.prototype.hasOwnProperty.call(doc["paths"]["/test"], "post")
  ).toBeTruthy();
});
