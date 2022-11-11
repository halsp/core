import { MicroRedisStartup } from "../src";

describe("prefix", () => {
  jest.mock("redis", () => {
    return {
      createClient: () => {
        return {
          connect: () => undefined,
          subscribe: () => undefined,
        };
      },
    };
  });

  it("should subscribe and publish pattern with prefix", async () => {
    let publishPattern = "";
    let subscribePattern = "";
    let subscribeCallback: any;
    const startup = new MicroRedisStartup({
      prefix: "pt_",
    }).pattern("test_pattern2", () => undefined);
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
    expect(subscribePattern).toBe("pt_test_pattern");
    expect(publishPattern).toBe("pt_test_pattern.123");
  });

  it("should not publish when pub is undefined", async () => {
    async function test(isPubUndefined: boolean) {
      let publishPattern = "";
      let subscribePattern = "";
      let subscribeCallback: any;
      const startup = new MicroRedisStartup();
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

      startup.patterns({
        pattern: "test_pattern",
        handler: () => undefined,
      });

      const str = JSON.stringify({
        id: "123",
        data: "d",
        pattern: "pt",
      });

      if (isPubUndefined) {
        (startup as any).pub = undefined;
      }
      await subscribeCallback(Buffer.from(`${str.length}#${str}`));

      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 500);
      });
      expect(subscribePattern).toBe("test_pattern");
      expect(publishPattern).toBe(isPubUndefined ? "" : "test_pattern.123");
    }

    await test(true);
    await test(false);
  });
});
