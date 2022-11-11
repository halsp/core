import { MicroNatsStartup } from "../src";

describe("headers", () => {
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

  it("should create req headers", async () => {
    let subscribePattern = "";
    let subscribeCallback: any;
    let reqHeaders: any;
    const startup = new MicroNatsStartup().use((ctx) => {
      reqHeaders = ctx.req.headers;
    });
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
      respond: () => undefined,
      headers: {
        h: "1",
      },
    });

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    expect(subscribePattern).toBe("test_pattern");
    expect(reqHeaders).toEqual({
      h: "1",
    });
  });

  it("should return res headers", async () => {
    let subscribePattern = "";
    let subscribeCallback: any;
    let resHeaders: any;
    const startup = new MicroNatsStartup().use((ctx) => {
      ctx.res.headers["h"] = "1";
    });
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
      respond: (buffer, opts) => {
        resHeaders = opts.headers;
      },
      headers: {
        h: 1,
      },
    });

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    expect(subscribePattern).toBe("test_pattern");
    expect(resHeaders).toEqual({
      h: "1",
    });
  });
});
