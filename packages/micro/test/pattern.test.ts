import { Request } from "@ipare/core";
import "../src";
import { parsePattern, composePattern } from "../src";
import { TestStartup } from "./utils";

describe("parse pattern", () => {
  it("should parse pattern from path", async () => {
    await new TestStartup(new Request().setPath("{a:1}"))
      .use((ctx) => {
        expect(ctx.req.pattern).toEqual({
          a: 1,
        });
      })
      .run();
  });

  it("should not change pattern when pattern is string", async () => {
    expect(parsePattern("abc:123")).toBe("abc:123");
  });

  it("should be object pattern when pattern is json", async () => {
    expect(parsePattern(`{"a":1}`)).toEqual({
      a: 1,
    });
  });
});

describe("sort pattern", () => {
  it("should not sort pattern when pattern is string", async () => {
    expect(composePattern("abc:123")).toBe("abc:123");
  });

  it("should sort pattern when pattern is json", async () => {
    expect(composePattern(`{"b":1,"a":2}`)).toBe(`{"a":2,"b":1}`);
  });

  it("should throw error when pattern is bool", async () => {
    expect(() => composePattern(true as any)).toThrow();
  });

  it("should throw error when pattern is number", async () => {
    expect(() => composePattern(123 as any)).toThrow();
  });
});
