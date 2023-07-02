import { MapItem } from "@halsp/router";
import { OpenApiBuilder } from "openapi3-ts-remove-yaml";
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
      new MapItem({
        path: "test.ts",
        actionName: "TestPost",
        url: "test1",
        methods: ["post"],
      }),
      new MapItem({
        path: "test.ts",
        actionName: "TestGet",
        url: "test1",
        methods: ["get"],
      }),
      new MapItem({
        path: "test.ts",
        actionName: "TestPost",
        url: "test2",
        methods: ["post"],
      }),
      new MapItem({
        path: "test.ts",
        actionName: "TestPost",
        url: "test2",
        methods: ["get"],
      }),
    ];
    const doc = runParserTest(mapItems);
    expect("post" in doc["paths"]["/test1"]).toBeTruthy();
  });

  it("shoude parse default", async () => {
    const mapItems = [
      new MapItem({
        path: "default.get.ts",
        actionName: "default",
        url: "def",
        methods: ["get"],
      }),
    ];
    const doc = runParserTest(mapItems);
    expect("get" in doc["paths"]["/def"]).toBeTruthy();
  });

  it("shoult parse not-action", async () => {
    const mapItems = [
      new MapItem({
        path: "not-action.ts",
        actionName: "func",
        url: "err",
        methods: ["get"],
      }),
    ];
    const doc = runParserTest(mapItems);
    expect(doc["paths"]["/err"]["get"]["tags"]).toBeUndefined();
  });
});

describe("body", () => {
  function getDoc(actionName: string) {
    const mapItems = [
      new MapItem({
        path: "body.ts",
        actionName,
        url: "test",
        methods: ["post"],
      }),
    ];
    return runParserTest(mapItems) as any;
  }
  function getRequestContent(doc: any) {
    return doc["paths"]["/test"]["post"]["requestBody"]["content"][
      "application/json"
    ];
  }

  it("should parse string body", async () => {
    const doc = getDoc("StringBody");
    expect(getRequestContent(doc)).toEqual({
      schema: {
        type: "string",
        description: "abc",
      },
    });
  });

  it("should compose partial body and model body", async () => {
    const doc = getDoc("PartialBody");
    expect(getRequestContent(doc)).toEqual({
      schema: {
        properties: {
          b: {
            description: "abc",
            type: "string",
          },
          test: {
            description: "test",
            type: "string",
          },
        },
        type: "object",
      },
    });
  });

  it("should parse string body twice", async () => {
    const doc = getDoc("StringBodyTwice");
    expect(getRequestContent(doc)).toEqual({
      schema: {
        type: "string",
        description: "def",
      },
    });
  });

  it("should set schema from pipe", async () => {
    const doc = getDoc("DtoSchema");
    expect(getRequestContent(doc)).toEqual({
      schema: {
        type: "object",
        description: "desc",
        properties: {},
      },
    });
  });

  it("should override schema when dto class has decorators", async () => {
    const doc = getDoc("DtoSchemaOverride");
    expect(getRequestContent(doc)).toEqual({
      schema: {
        type: "object",
        description: "desc2",
        properties: {},
      },
    });
  });
});

describe("content type", () => {
  it("should set default content types", () => {
    const mapItems = [
      new MapItem({
        path: "content-type.ts",
        actionName: "DefaultAction",
        url: "test",
        methods: ["post"],
      }),
    ];
    const doc = runParserTest(mapItems);

    expect(
      Object.keys(doc["paths"]["/test"]["post"]["requestBody"]["content"])
    ).toEqual(["application/json"]);
  });

  it("should set default content types when @ContentTypes value is empty array", () => {
    const mapItems = [
      new MapItem({
        path: "content-type.ts",
        actionName: "EmptyAction",
        url: "test",
        methods: ["post"],
      }),
    ];
    const doc = runParserTest(mapItems);

    expect(
      Object.keys(doc["paths"]["/test"]["post"]["requestBody"]["content"])
    ).toEqual(["application/json"]);
  });

  it("should set custom content types", () => {
    const mapItems = [
      new MapItem({
        path: "content-type.ts",
        actionName: "AddAction",
        url: "test",
        methods: ["post"],
      }),
    ];
    const doc = runParserTest(mapItems);

    expect(
      Object.keys(doc["paths"]["/test"]["post"]["requestBody"]["content"])
    ).toEqual(["mt"]);
  });

  it("should set multiple custom content types", () => {
    const mapItems = [
      new MapItem({
        path: "content-type.ts",
        actionName: "MultipleAction",
        url: "test",
        methods: ["post"],
      }),
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
      new MapItem({
        path: "ignore.ts",
        actionName: "IgnoreAction",
        url: "ignore",
        methods: ["post"],
      }),
    ];
    const doc = runParserTest(mapItems);

    expect(doc["paths"]["/ignore"]).toEqual({});
  });

  it("should ignore property", async () => {
    const mapItems = [
      new MapItem({
        path: "ignore.ts",
        actionName: "IgnoreProperty",
        url: "ignore",
        methods: ["post"],
      }),
    ];
    const doc = runParserTest(mapItems);

    expect(doc["paths"]["/ignore"]["post"]["parameters"]).toEqual([]);
  });

  it("should ignore param", async () => {
    const mapItems = [
      new MapItem({
        path: "ignore.ts",
        actionName: "IgnoreParam",
        url: "ignore",
        methods: ["post"],
      }),
    ];
    const doc = runParserTest(mapItems);

    expect(doc["paths"]["/ignore"]["post"]["parameters"]).toEqual([]);
  });

  it("should ignore body model property", async () => {
    const mapItems = [
      new MapItem({
        path: "ignore.ts",
        actionName: "IgnoreBodyModel",
        url: "ignore",
        methods: ["post"],
      }),
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
      new MapItem({
        path: "ignore.ts",
        actionName: "IgnoreParamModel",
        url: "ignore",
        methods: ["post"],
      }),
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
    const mapItems = [
      new MapItem({
        path: "response.ts",
        actionName,
        url: "test",
        methods: ["post"],
      }),
    ];
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

  it("should set response array body", async () => {
    const doc = getDoc("ResponseArrayBody");
    expect(doc["components"]["schemas"]["ResultDto"]).not.toBeUndefined();
    expect(doc["components"]["schemas"]["TestDto"]).not.toBeUndefined();
    expect(getResponses(doc)).toEqual({
      default: {
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ResultDto",
              },
            },
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

  it("should set response content types", async () => {
    const doc = getDoc("ResponseContentTypes");
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

  it("should set response content types", async () => {
    const doc = getDoc("ResponseStatusContentTypes");
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

describe("array", () => {
  function getDoc(actionName: string) {
    const mapItems = [
      new MapItem({
        path: "array.ts",
        actionName,
        url: "test",
        methods: ["post"],
      }),
    ];
    return runParserTest(mapItems) as any;
  }
  function getRequestContent(doc: any) {
    return doc["paths"]["/test"]["post"]["requestBody"]["content"][
      "application/json"
    ];
  }
  function getRequestParameters(doc: any) {
    return doc["paths"]["/test"]["post"]["parameters"];
  }

  it("should parse dto item", async () => {
    const doc = getDoc("NotArray");
    expect(getRequestContent(doc)).toEqual({
      schema: {
        properties: {
          b1: {
            description: "desc",
            type: "string",
          },
        },
        type: "object",
      },
    });
  });

  it("should parse array dto", async () => {
    const doc = getDoc("ArrayModel");
    expect(getRequestContent(doc)).toEqual({
      schema: {
        type: "array",
        items: {
          $ref: "#/components/schemas/TestDto",
        },
      },
    });
  });

  it("should parse two-dimensional array dto", async () => {
    const doc = getDoc("TwoDimensionalArray");
    expect(getRequestContent(doc)).toEqual({
      schema: {
        type: "array",
        items: {
          type: "array",
          items: {
            $ref: "#/components/schemas/TestDto",
          },
        },
      },
    });
  });

  it("should parse string array body", async () => {
    const doc = getDoc("StringArrayBody");
    expect(getRequestContent(doc)).toEqual({
      schema: {
        type: "array",
        items: {
          type: "string",
        },
      },
    });
  });

  it("should be ignore when parse string array header", async () => {
    const doc = getDoc("StringArrayParam");
    expect(getRequestParameters(doc)).toEqual([]);
  });

  it("should be ignore when parse string array header", async () => {
    const doc = getDoc("ModelArrayParam");
    expect(getRequestParameters(doc)).toEqual([]);
  });

  it("should parse model header with array string property", async () => {
    const doc = getDoc("ParamStringArrayProperty");
    expect(getRequestParameters(doc)).toEqual([
      {
        description: "desc",
        in: "header",
        name: "b1",
        required: false,
        schema: {
          description: "desc",
          items: {
            type: "string",
          },
          type: "array",
        },
      },
      {
        in: "header",
        name: "b2",
        required: false,
        schema: {
          $ref: "#/components/schemas/TestDto",
        },
      },
    ]);
  });

  it("should parse model body with array model property", async () => {
    const doc = getDoc("BodyModelArrayProperty");
    expect(getRequestContent(doc)).toEqual({
      schema: {
        properties: {
          b1: {
            items: {
              $ref: "#/components/schemas/TestDto",
            },
            type: "array",
          },
          b2: {
            $ref: "#/components/schemas/TestDto",
          },
        },
        type: "object",
      },
    });
  });

  it("should parse array model body with array model property", async () => {
    const doc = getDoc("ArrayBodyModelArrayProperty");
    expect(getRequestContent(doc)).toEqual({
      schema: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ModelArrayPropertyDto",
        },
      },
    });
  });
});
