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

describe("parser", () => {
  it("should parse", async () => {
    const doc = runParserTest();
    expect(doc["openapi"]).toBe("3.0.0");
  });

  it("should parse map", async () => {
    const mapItems = [
      new MapItem("test.ts", "TestPost", "test1", ["post"]),
      new MapItem("test.ts", "TestGet", "test1", ["get"]),
      new MapItem("test.ts", "TestPost", "test2", ["post"]),
      new MapItem("test.ts", "TestGet", "test2", ["get"]),
    ];
    const doc = runParserTest(mapItems);
    expect(
      Object.prototype.hasOwnProperty.call(doc["paths"]["/test1"], "post")
    ).toBeTruthy();
  });

  it("shoude parse default", async () => {
    const mapItems = [new MapItem("default.get.ts", "default", "def", ["get"])];
    const doc = runParserTest(mapItems);
    expect(
      Object.prototype.hasOwnProperty.call(doc["paths"]["/def"], "get")
    ).toBeTruthy();
  });

  it("shoult parse not-action", async () => {
    const mapItems = [new MapItem("not-action.ts", "func", "err", ["get"])];
    const doc = runParserTest(mapItems);
    expect(doc["paths"]["/err"]["get"]["tags"]).toBeUndefined();
  });
});

describe("media type", () => {
  it("should set default media types", () => {
    const mapItems = [
      new MapItem("media.ts", "DefaultAction", "test", ["post"]),
    ];
    const doc = runParserTest(mapItems);

    expect(
      Object.keys(doc["paths"]["/test"]["post"]["requestBody"]["content"])
    ).toEqual(["application/json"]);
  });

  it("should set default media types when @MediaTypes value is empty array", () => {
    const mapItems = [new MapItem("media.ts", "EmptyAction", "test", ["post"])];
    const doc = runParserTest(mapItems);

    expect(
      Object.keys(doc["paths"]["/test"]["post"]["requestBody"]["content"])
    ).toEqual(["application/json"]);
  });

  it("should set custom media types", () => {
    const mapItems = [new MapItem("media.ts", "AddAction", "test", ["post"])];
    const doc = runParserTest(mapItems);

    expect(
      Object.keys(doc["paths"]["/test"]["post"]["requestBody"]["content"])
    ).toEqual(["mt"]);
  });

  it("should set multiple custom media types", () => {
    const mapItems = [
      new MapItem("media.ts", "MultipleAction", "test", ["post"]),
    ];
    const doc = runParserTest(mapItems);

    expect(
      Object.keys(doc["paths"]["/test"]["post"]["requestBody"]["content"])
    ).toEqual(["mt1", "mt2", "mt3"]);
  });
});

describe("ignore", () => {
  it("should ignore action", async () => {
    const mapItems = [
      new MapItem("ignore.ts", "IgnoreAction", "ignore", ["post"]),
    ];
    const doc = runParserTest(mapItems);

    expect(doc["paths"]["/ignore"]).toEqual({});
  });

  it("should ignore property", async () => {
    const mapItems = [
      new MapItem("ignore.ts", "IgnoreProperty", "ignore", ["post"]),
    ];
    const doc = runParserTest(mapItems);

    expect(doc["paths"]["/ignore"]["post"]["parameters"]).toEqual([]);
  });

  it("should ignore param", async () => {
    const mapItems = [
      new MapItem("ignore.ts", "IgnoreParam", "ignore", ["post"]),
    ];
    const doc = runParserTest(mapItems);

    expect(doc["paths"]["/ignore"]["post"]["parameters"]).toEqual([]);
  });

  it("should ignore body model property", async () => {
    const mapItems = [
      new MapItem("ignore.ts", "IgnoreBodyModel", "ignore", ["post"]),
    ];
    const doc = runParserTest(mapItems);

    expect(
      doc["paths"]["/ignore"]["post"]["requestBody"]["content"][
        "application/json"
      ]["schema"]["properties"]
    ).toEqual({
      b1: {
        nullable: false,
        type: "string",
      },
    });
  });

  it("should ignore param model property", async () => {
    const mapItems = [
      new MapItem("ignore.ts", "IgnoreParamModel", "ignore", ["post"]),
    ];
    const doc = runParserTest(mapItems);

    expect(doc["paths"]["/ignore"]["post"]["parameters"]).toEqual([
      {
        name: "b1",
        in: "header",
        required: true,
        schema: {
          nullable: false,
          type: "string",
        },
      },
    ]);
  });
});
