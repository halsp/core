import { parseBuffer } from "../src";
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

describe("parse buffer", () => {
  it("should parse buffer empty content", async () => {
    await new Promise<void>((resolve) => {
      parseBuffer(Buffer.from("2#{}"), (packet) => {
        expect(packet).toEqual({});
        resolve();
      });
    });
  });

  it("should parse buffer multiply", async () => {
    let times = 0;
    await new Promise<void>((resolve) => {
      parseBuffer(Buffer.from("2#{}2#{}"), (packet) => {
        expect(packet).toEqual({});
        times++;
        if (times >= 2) {
          resolve();
        }
      });
    });
  });

  it("should throw error when message format is illegal", async () => {
    expect(() => parseBuffer(Buffer.from("abc"), () => undefined)).toThrow(
      "Error message format"
    );
  });

  it("should throw error when length is not a number", async () => {
    expect(() => parseBuffer(Buffer.from("a#{}"), () => undefined)).toThrow(
      `Error length "a"`
    );
  });

  it("should throw error when length is illegal", async () => {
    expect(() => parseBuffer(Buffer.from("3#{}"), () => undefined)).toThrow(
      `Required length "3", bug actual length is "2"`
    );
  });
});
