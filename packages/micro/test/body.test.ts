import { parseMicroPayload } from "../src/startup";

describe("parse json body", () => {
  it("should parse json str body", async () => {
    expect(parseMicroPayload(`{"a":1}`)).toEqual({ a: 1 });
    expect(parseMicroPayload(`[1,2]`)).toEqual([1, 2]);
  });

  it("should not parse body when body is not json string", async () => {
    expect(parseMicroPayload(`abcd`)).toBe("abcd");
    expect(parseMicroPayload(`{abcd`)).toBe("{abcd");
    expect(parseMicroPayload(undefined)).toBe(undefined);
    expect(parseMicroPayload(true)).toBe(true);
    expect(parseMicroPayload(false)).toBe(false);
    expect(parseMicroPayload(123)).toBe(123);
  });
});
