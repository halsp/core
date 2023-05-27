import { parseJsonBuffer } from "../src";

describe("parse json buffer", () => {
  it("should parse json buffer", async () => {
    expect(parseJsonBuffer(Buffer.from(`{"a":1}`))).toEqual({
      a: 1,
    });
  });

  it("should parse empty json object", async () => {
    expect(parseJsonBuffer(Buffer.from("{}"))).toEqual({});
  });

  it("should not parse string value", async () => {
    expect(parseJsonBuffer(Buffer.from("abc"))).toBe("abc");
  });
});
