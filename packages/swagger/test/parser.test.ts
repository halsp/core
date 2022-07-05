import { MapItem } from "@sfajs/router";
import { OpenApiBuilder } from "openapi3-ts";
import {
  ACTION_METADATA_API_SUMMARY,
  ACTION_METADATA_API_TAGS,
} from "../src/constant";
import { Parser } from "../src/parser";
import { SwaggerOptions } from "../src/swagger-options";

function runParserTest(
  routerMap?: readonly MapItem[],
  options: SwaggerOptions = {}
) {
  const builder = new OpenApiBuilder();
  process.chdir("test/parser");
  try {
    new Parser(
      routerMap ?? [],
      builder,
      {
        dir: ".",
      },
      options
    ).parse();
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
  mapItems[0][ACTION_METADATA_API_TAGS] = ["test"];
  mapItems[0][ACTION_METADATA_API_SUMMARY] = "test summary";
  const doc = runParserTest(mapItems);
  expect(Object.hasOwn(doc["paths"]["/test1"], "post")).toBeTruthy();
});

test("default", async () => {
  const mapItems = [new MapItem("default.get.ts", "default", "def", ["get"])];
  const doc = runParserTest(mapItems);
  expect(Object.hasOwn(doc["paths"]["/def"], "get")).toBeTruthy();
});

test("not action func", async () => {
  const mapItems = [new MapItem("not-action.ts", "func", "err", ["get"])];
  const doc = runParserTest(mapItems);
  expect(doc["paths"]["/err"]["get"]["tags"]).toEqual([]);
});

test("error pipe records", async () => {
  const mapItems = [new MapItem("not-action.ts", "TestClass", "err", ["get"])];
  const doc = runParserTest(mapItems);
  expect(doc["paths"]["/err"]["get"]["tags"]).toEqual([]);
});
