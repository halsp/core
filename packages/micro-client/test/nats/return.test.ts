import { MicroNatsClient } from "../../src";

describe("return", () => {
  async function runTest(data?: Buffer, err?: Error) {
    const client = new MicroNatsClient();
    (client as any).connection = {
      isClosed: () => false,
      subscribe: (pattern: string, opts) => {
        setTimeout(() => {
          opts.callback(err, {
            data: data,
          });
        }, 500);
        return {
          unsubscribe: () => undefined,
        };
      },
      publish: () => undefined,
      close: () => undefined,
    };

    const result = await client.send("", "");
    await client.dispose();
    return result;
  }

  it("should return when subscribe callback", async () => {
    const str = JSON.stringify({
      id: "123",
      pattern: "test",
      data: "d",
    });
    const result = await runTest(Buffer.from(str));
    expect(result.data).toBe("d");
    expect(result.error).toBeUndefined();
  });

  it("should return when subscribe callback response", async () => {
    const str = JSON.stringify({
      id: "123",
      pattern: "test",
      response: "d",
    });
    const result = await runTest(Buffer.from(str));
    expect(result.data).toBe("d");
    expect(result.error).toBeUndefined();
  });

  it("should return error when callback error is not undefined", async () => {
    const result = await runTest(undefined, new Error("err"));

    expect(result.data).toBeUndefined();
    expect(result.error).toBe("err");
  });

  it("should return error and data when callback error is not undefined", async () => {
    const str = JSON.stringify({
      id: "123",
      pattern: "test",
      data: "d",
    });
    const result = await runTest(Buffer.from(str), new Error("err"));

    expect(result.data).toBe("d");
    expect(result.error).toBe("err");
  });
});
