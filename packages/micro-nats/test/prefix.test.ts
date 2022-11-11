import { MicroNatsStartup } from "../src";

describe("prefix", () => {
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

  it("should subscribe and publish pattern with prefix", async () => {
    let response: any;
    let subscribePattern = "";
    let subscribeCallback: any;
    const startup = new MicroNatsStartup({
      prefix: "pt_",
    }).pattern("test_pattern2", () => undefined);
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
    expect(subscribePattern).toBe("pt_test_pattern");
    expect(response.toString("utf-8")).toBe('12#{"id":"123"}');
  });
});
