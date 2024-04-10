import { MapItem } from "@halsp/router";
import { OpenApiBuilder } from "openapi3-ts-remove-yaml";
import { Parser } from "../src/parser";
import { runin } from "@halsp/testing";

test("decorators", async () => {
  const builder = new OpenApiBuilder();
  await runin("test/parser", async () => {
    await new Parser(
      [
        new MapItem({
          path: "decorator.ts",
          actionName: "TestDecorator",
          url: "test",
          methods: ["post"],
        }),
      ],
      builder,
    ).parse();
  });
  const doc = builder.getSpec();
  expect("post" in doc["paths"]["/test"]).toBeTruthy();
});
