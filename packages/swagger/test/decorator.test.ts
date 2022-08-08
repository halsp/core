import { TestStartup } from "@ipare/testing";
import { MapItem } from "@ipare/router";
import { OpenApiBuilder } from "openapi3-ts";
import {
  getCallbacks,
  getPipeRecordModelType,
} from "../src/decorators/callback.decorator";
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

test("getCallbacks class", async () => {
  expect(getCallbacks(TestStartup)).toEqual([]);
});
