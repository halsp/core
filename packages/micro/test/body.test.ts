import { parseMicroBody } from "../src/startup";

describe("parse json body", () => {
  it("should parse json str body", async () => {
    expect(parseMicroBody(`{"a":1}`)).toEqual({ a: 1 });
    expect(parseMicroBody(`[1,2]`)).toEqual([1, 2]);
  });

  it("should not parse body when body is not json string", async () => {
    expect(parseMicroBody(`abcd`)).toBe("abcd");
    expect(parseMicroBody(`{abcd`)).toBe("{abcd");
    expect(parseMicroBody(undefined)).toBe(undefined);
    expect(parseMicroBody(true)).toBe(true);
    expect(parseMicroBody(false)).toBe(false);
    expect(parseMicroBody(123)).toBe(123);
  });
});
