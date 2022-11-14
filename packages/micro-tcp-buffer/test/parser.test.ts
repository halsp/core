import { parseBuffer } from "../src";

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
