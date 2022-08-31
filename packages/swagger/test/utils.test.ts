import { pipeTypeToDocType } from "../src/parser/utils";

describe("pipeTypeToDocType", () => {
  test("should throw when error parameters", async () => {
    expect(() => pipeTypeToDocType("body")).toThrow();
  });

  test("should translate header", async () => {
    expect(pipeTypeToDocType("header")).toBe("header");
  });

  test("should translate query", async () => {
    expect(pipeTypeToDocType("query")).toBe("query");
  });

  test("should translate param", async () => {
    expect(pipeTypeToDocType("param")).toBe("path");
  });
});
