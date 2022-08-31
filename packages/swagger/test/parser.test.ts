import { MapItem } from "@ipare/router";
import { OpenApiBuilder } from "openapi3-ts";
import { Parser } from "../src/parser";

function runParserTest(routerMap?: readonly MapItem[]) {
  const builder = new OpenApiBuilder();
  process.chdir("test/parser");
  try {
    new Parser(routerMap ?? [], builder, {
      dir: ".",
    }).parse();
  } finally {
    process.chdir("../..");
  }
  const apiDoc = builder.getSpec();
  return apiDoc;
}

test("parser", async () => {
  const doc = runParserTest();
  expect(doc["openapi"]).toBe("3.0.0");
});

test("default", async () => {
  const mapItems = [new MapItem("default.get.ts", "default", "def", ["get"])];
  const doc = runParserTest(mapItems);
  expect(
    Object.prototype.hasOwnProperty.call(doc["paths"]["/def"], "get")
  ).toBeTruthy();
});

test("not action func", async () => {
  const mapItems = [new MapItem("not-action.ts", "func", "err", ["get"])];
  const doc = runParserTest(mapItems);
  expect(doc["paths"]["/err"]["get"]["tags"]).toBeUndefined();
});

test("error pipe records", async () => {
  const mapItems = [new MapItem("not-action.ts", "TestClass", "err", ["get"])];
  const doc = runParserTest(mapItems);
  expect(doc["paths"]["/err"]["get"]["tags"]).toBeUndefined();
});
