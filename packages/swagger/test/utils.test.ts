import { pipeTypeToDocType } from "../src/parser/utils/doc-types";

test("pipeTypeToDocType body", async () => {
  expect(() => pipeTypeToDocType("body")).toThrow();
});

test("pipeTypeToDocType header", async () => {
  expect(pipeTypeToDocType("header")).toBe("header");
});

test("pipeTypeToDocType query", async () => {
  expect(pipeTypeToDocType("query")).toBe("query");
});

test("pipeTypeToDocType param", async () => {
  expect(pipeTypeToDocType("param")).toBe("path");
});
