import { TestMicroNatsClient, TestMicroNatsStartup } from "../src/micro-nats";

describe("micro-nats", () => {
  jest.mock("nats", () => {
    return {
      connect: () => {
        return {
          connect: () => undefined,
          subscribe: () => undefined,
        };
      },
      headers: () => {
        return {};
      },
    };
  });

  it("should subscribe and publish", async () => {
    let response: any;
    let subscribePattern = "";
    let subscribeCallback: any;
    const startup = new TestMicroNatsStartup();
    await startup.listen();

    (startup as any).connection = {
      isClosed: () => false,
      subscribe: (pattern: string, opts) => {
        subscribePattern = pattern;
        subscribeCallback = opts.callback;
        return {
          unsubscribe: () => undefined,
        };
      },
    };

    startup.pattern("test_pattern", () => undefined);

    const str = JSON.stringify({
      id: "123",
      data: "d",
      pattern: "pt",
    });
    await subscribeCallback(undefined, {
      data: Uint8Array.from(Buffer.from(`${str.length}#${str}`)),
      reply: "456",
      respond: (buffer) => {
        response = buffer;
      },
    });

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    expect(subscribePattern).toBe("test_pattern");
    expect(response.toString("utf-8")).toBe('12#{"id":"123"}');
  });

  it("should be not connected", async () => {
    const client = new TestMicroNatsClient();
    const result = await client.send("", "");
    expect(result).toEqual({
      error: "The connection is not connected",
      headers: {},
    });
  });
});
