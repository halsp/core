import { MicroNatsClient } from "../src";

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
  });

  it("should return when subscribe callback response", async () => {
    const str = JSON.stringify({
      id: "123",
      pattern: "test",
      response: "d",
    });
    const result = await runTest(Buffer.from(str));
    expect(result.data).toBe("d");
  });

  it("should return error when callback error is not undefined", async () => {
    let error: any;
    try {
      await runTest(undefined, new Error("err"));
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe("err");
  });

  it("should return error and data when callback error is defined", async () => {
    const str = JSON.stringify({
      id: "123",
      pattern: "test",
      data: "d",
    });

    let error: any;
    try {
      await runTest(Buffer.from(str), new Error("err"));
    } catch (err) {
      error = err;
    }
    expect(error.message).toBe("err");
  });

  it("should return error and data when result.error is defined", async () => {
    const str = JSON.stringify({
      id: "123",
      pattern: "test",
      error: "err",
    });

    let error: any;
    try {
      await runTest(Buffer.from(str));
    } catch (err) {
      error = err;
    }
    expect(error.message).toBe("err");
  });
});
