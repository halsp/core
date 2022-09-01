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

describe("response", () => {
  function getDoc(actionName: string) {
    const mapItems = [new MapItem("response.ts", actionName, "test", ["post"])];
    return runParserTest(mapItems) as any;
  }
  function getResponses(doc: any) {
    return doc["paths"]["/test"]["post"]["responses"];
  }

  it("should set response body", async () => {
    const doc = getDoc("ResponseBody");
    expect(doc["components"]["schemas"]["ResultDto"]).not.toBeUndefined();
    expect(doc["components"]["schemas"]["TestDto"]).not.toBeUndefined();
    expect(getResponses(doc)).toEqual({
      default: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ResultDto" },
          },
        },
        description: "",
      },
    });
  });

  it("should set response body by schema", async () => {
    const doc = getDoc("ResponseSchema");
    expect(getResponses(doc)).toEqual({
      default: {
        content: {
          "application/json": {
            schema: {
              properties: {
                p1: {
                  type: "number",
                  nullable: true,
                },
              },
            },
          },
        },
        description: "",
      },
    });
  });

  it("should set response body with status 200", async () => {
    const doc = getDoc("StatusResponseBody");
    expect(getResponses(doc)).toEqual({
      "200": {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ResultDto" },
          },
        },
        description: "",
      },
    });
  });

  it("should set response body with status 200 and default", async () => {
    const doc = getDoc("StatusAndDefaultResponseBody");

    const content = {
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ResultDto" },
        },
      },
      description: "",
    };
    expect(getResponses(doc)).toEqual({
      default: content,
      "200": content,
    });
  });

  it("should set response description", async () => {
    const doc = getDoc("ResponseDescription");
    expect(getResponses(doc)).toEqual({
      default: {
        description: "desc",
      },
    });
  });

  it("should set response description with status 200", async () => {
    const doc = getDoc("ResponseStatusDescription");
    expect(getResponses(doc)).toEqual({
      "200": {
        description: "desc",
      },
    });
  });

  it("should set response description with status 200", async () => {
    const doc = getDoc("ResponseStatusAndDefaultDescription");
    expect(getResponses(doc)).toEqual({
      default: {
        description: "desc",
      },
      "200": {
        description: "desc",
      },
    });
  });

  it("should set response headers", async () => {
    const doc = getDoc("ResponseHeaders");
    expect(getResponses(doc)).toEqual({
      default: {
        description: "",
        headers: {
          h1: {
            required: true,
          },
          h2: {
            description: "h-2",
          },
        },
      },
    });
  });

  it("should set response headers with status", async () => {
    const doc = getDoc("ResponseStatusHeaders");
    expect(getResponses(doc)).toEqual({
      "200": {
        description: "",
        headers: {
          h1: {
            required: true,
          },
        },
      },
    });
  });

  it("should set response headers with status and default", async () => {
    const doc = getDoc("ResponseStatusAndDefaultHeaders");
    expect(getResponses(doc)).toEqual({
      default: {
        description: "",
        headers: {
          h1: {
            required: true,
          },
          h2: {
            description: "h-2",
          },
        },
      },
      "200": {
        description: "",
        headers: {
          h1: {
            required: true,
          },
        },
      },
    });
  });

  it("should set response media types", async () => {
    const doc = getDoc("ResponseMediaTypes");
    expect(getResponses(doc)).toEqual({
      default: {
        content: {
          mt1: {
            schema: { $ref: "#/components/schemas/TestDto" },
          },
          mt2: {
            schema: { $ref: "#/components/schemas/TestDto" },
          },
        },
        description: "",
      },
    });
  });

  it("should set response media types", async () => {
    const doc = getDoc("ResponseStatusMediaTypes");
    expect(getResponses(doc)).toEqual({
      default: {
        content: {
          mt1: {
            schema: { $ref: "#/components/schemas/TestDto" },
          },
          mt2: {
            schema: { $ref: "#/components/schemas/TestDto" },
          },
        },
        description: "",
      },
      "200": {
        content: {
          mt1: {
            schema: { $ref: "#/components/schemas/ResultDto" },
          },
          mt2: {
            schema: { $ref: "#/components/schemas/ResultDto" },
          },
        },
        description: "",
      },
    });
  });
});
