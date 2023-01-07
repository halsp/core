import { MicroNatsStartup } from "../src";

describe("headers", () => {
  it("should create req headers", async () => {
    let subscribePattern = "";
    let subscribeCallback: any;
    let reqHeaders: any;
    const startup = new MicroNatsStartup().use((ctx) => {
      reqHeaders = ctx.req.headers;
    });
    await startup.listen();

    const connection = (startup as any).connection;
    const subscribe = connection.subscribe;
    connection.subscribe = (pattern: string, opts: any) => {
      subscribePattern = pattern;
      subscribeCallback = opts.callback;
      return subscribe.bind(connection)(pattern, opts);
    };

    startup.pattern("test_pattern", () => undefined);

    const str = JSON.stringify({
      id: "123",
      data: "d",
      pattern: "pt",
    });
    await subscribeCallback(undefined, {
      data: Uint8Array.from(Buffer.from(str)),
      reply: "456",
      respond: () => undefined,
      headers: {
        h: "1",
      },
    });

    await startup.close();

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    expect(subscribePattern).toBe("test_pattern");
    expect(reqHeaders["h"]).toBe("1");
  });

  it("should return res headers", async () => {
    let subscribePattern = "";
    let subscribeCallback: any;
    let resHeaders: any;
    const startup = new MicroNatsStartup().use((ctx) => {
      ctx.res.headers["h"] = "1";
    });
    await startup.listen();

    const connection = (startup as any).connection;
    const subscribe = connection.subscribe;
    connection.subscribe = (pattern: string, opts: any) => {
      subscribePattern = pattern;
      subscribeCallback = opts.callback;
      return subscribe.bind(connection)(pattern, opts);
    };

    startup.pattern("test_pattern", () => undefined);

    const str = JSON.stringify({
      id: "123",
      data: "d",
      pattern: "pt",
    });
    await subscribeCallback(undefined, {
      data: Uint8Array.from(Buffer.from(str)),
      reply: "456",
      respond: (buffer, opts) => {
        resHeaders = opts.headers;
      },
      headers: {
        h: 1,
      },
    });

    await startup.close();

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    expect(subscribePattern).toBe("test_pattern");
    expect(resHeaders["h"]).toBe("1");
  });
});
