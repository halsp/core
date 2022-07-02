import { TestStartup } from "@sfajs/core";
import { MapItem } from "@sfajs/router";
import { OpenApiBuilder } from "openapi3-ts";
import { Parser } from "../src/parser";
import {
  getModelDecorators,
  getPipeRecordModelType,
} from "../src/parser/utils/decorator";

test("decorators", async () => {
  const builder = new OpenApiBuilder();
  process.chdir("test");
  try {
    new Parser(
      [new MapItem("decorator.ts", "TestDecorator", "test", ["post"])],
      builder,
      {
        dir: "parser",
      },
      {
        modelCwd: "parser",
      }
    ).parse();
  } finally {
    process.chdir("..");
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

test("getModelDecorators class", async () => {
  expect(getModelDecorators(TestStartup)).toEqual([]);
});
