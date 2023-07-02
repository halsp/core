import { MapItem } from "@halsp/router";
import { OpenApiBuilder } from "openapi3-ts-remove-yaml";
import { Parser } from "../src/parser";

test("decorators", async () => {
  const builder = new OpenApiBuilder();
  process.chdir("test/parser");
  try {
    new Parser(
      [
        new MapItem({
          path: "decorator.ts",
          actionName: "TestDecorator",
          url: "test",
          methods: ["post"],
        }),
      ],
      builder,
      {
        dir: ".",
      }
    ).parse();
  } finally {
    process.chdir("../..");
  }
  const doc = builder.getSpec();
  expect("post" in doc["paths"]["/test"]).toBeTruthy();
});
