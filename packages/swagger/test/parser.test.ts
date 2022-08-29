import { MapItem } from "@ipare/router";
import { OpenApiBuilder } from "openapi3-ts";
import { ACTION_DECORATORS, IGNORE } from "../src/constant";
import { Parser } from "../src/parser";
import { IgnoreParser } from "../src/parser/ignore.parser";

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

test("map parser", async () => {
  const mapItems = [
    new MapItem("test.ts", "TestPost", "test1", ["post"]),
    new MapItem("test.ts", "TestGet", "test1", ["get"]),
    new MapItem("test.ts", "TestPost", "test2", ["post"]),
    new MapItem("test.ts", "TestGet", "test2", ["get"]),
  ];
  mapItems[0][ACTION_DECORATORS] = [
    (opt) => {
      opt.tags = ["test"];
    },
    (opt) => {
      opt.summary = ["test summary"];
    },
  ];
  const doc = runParserTest(mapItems);
  expect(
    Object.prototype.hasOwnProperty.call(doc["paths"]["/test1"], "post")
  ).toBeTruthy();
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

test("ignore", async () => {
  const builder = new OpenApiBuilder();
  const item: any = {};
  item["$ref"] = `#/components/schemas/testName`;
  builder.addPath("p", {
    abc: [item],
  } as any);
  const schema = {};
  schema[IGNORE] = true;
  builder.addSchema("testName", schema);
  new IgnoreParser(builder).parse();
  const doc = builder.getSpec();
  expect(JSON.stringify(doc).includes("testName")).toBeFalsy();
});
