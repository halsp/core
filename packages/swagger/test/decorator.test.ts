import { TestStartup } from "@sfajs/core";
import { MapItem } from "@sfajs/router";
import { OpenApiBuilder } from "openapi3-ts";
import { Parser } from "../src/parser";
import {
  getModelPropertyDecorators,
  getPipeRecordModelType,
} from "../src/parser/utils/decorator";

test("decorators", async () => {
  const builder = new OpenApiBuilder();
  process.chdir("test/parser");
  try {
    new Parser(
      [new MapItem("decorator.ts", "TestDecorator", "test", ["post"])],
      builder,
      {
        dir: ".",
      },
      {}
    ).parse();
  } finally {
    process.chdir("../..");
  }
  const doc = builder.getSpec();
  expect(Object.hasOwn(doc["paths"]["/test"], "post")).toBeTruthy();
});

test("getPipeRecordModelType error", async () => {
  expect(
    getPipeRecordModelType(TestStartup, {
      parameterIndex: 0,
      propertyKey: "",
      type: "header",
      property: "",
      pipes: [],
    })
  ).toBeUndefined();
});

test("getModelPropertyDecorators class", async () => {
  expect(getModelPropertyDecorators(TestStartup)).toEqual([]);
});
