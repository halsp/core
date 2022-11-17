import { EventEmitter } from "stream";
import { ReadIterator, StreamIterator, WriteIterator } from "../src";

describe("stream", () => {
  it("should create write iterator", async () => {
    const writeIterator = new WriteIterator<string>();
    writeIterator.push("a");
    setTimeout(() => {
      writeIterator.push("b");
      writeIterator.push("c");
      setTimeout(() => {
        writeIterator.push("d");
        writeIterator.end();
      }, 500);
    }, 500);

    const result: string[] = [];
    for await (const item of writeIterator) {
      result.push(item);
    }

    expect(writeIterator instanceof StreamIterator).toBeTruthy();
    expect(result).toEqual(["a", "b", "c", "d"]);
  });

  it("should create read iterator", async () => {
    const stream = new EventEmitter();
    const readIterator = new ReadIterator(stream as any);

    stream.emit("data", "a");
    setTimeout(() => {
      stream.emit("data", "b");
      stream.emit("data", "c");
      setTimeout(() => {
        stream.emit("data", "d");
        stream.emit("end");
      }, 500);
    }, 500);

    const result: string[] = [];
    for await (const item of readIterator) {
      result.push(item);
    }
    expect(result).toEqual(["a", "b", "c", "d"]);
  });
});
