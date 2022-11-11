import {
  TestMicroRedisClient,
  TestMicroRedisStartup,
} from "../src/micro-redis";

describe("micro-redis", () => {
  jest.mock("redis", () => {
    return {
      createClient: () => {
        return {
          connect: () => undefined,
        };
      },
    };
  });

  it("should subscribe and publish", async () => {
    let publishPattern = "";
    let subscribePattern = "";
    let subscribeCallback: any;
    const startup = new TestMicroRedisStartup();
    await startup.listen();

    (startup as any).sub = {
      isReady: true,
      subscribe: (pattern: string, callback: any) => {
        subscribePattern = pattern;
        subscribeCallback = callback;
      },
      unsubscribe: () => undefined,
    };
    (startup as any).pub = {
      isReady: true,
      publish: (pattern: string) => {
        publishPattern = pattern;
      },
    };

    startup.pattern("test_pattern", () => undefined);

    const str = JSON.stringify({
      id: "123",
      data: "d",
      pattern: "pt",
    });
    await subscribeCallback(Buffer.from(`${str.length}#${str}`));

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    expect(subscribePattern).toBe("test_pattern");
    expect(publishPattern).toBe("test_pattern.123");
  });

  it("should be not connected", async () => {
    const client = new TestMicroRedisClient();
    const result = await client.send("", "");
    expect(result).toEqual({
      error: "The connection is not connected",
    });
  });
});
