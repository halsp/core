import { MicroRedisStartup } from "../src";

describe("startup", () => {
  it("should connect redis", async () => {
    let connect = false;
    let disconnect = false;

    jest.mock("redis", () => {
      return {
        createClient: () => {
          return {
            connect: () => {
              connect = true;
            },
            subscribe: () => undefined,
            quit: () => {
              disconnect = true;
            },
            isOpen: true,
            isReady: true,
          };
        },
      };
    });

    const startup = new MicroRedisStartup();
    const { pub, sub } = await startup.listen();
    await startup.close();

    expect(!!sub).toBeTruthy();
    expect(!!pub).toBeTruthy();
    expect(connect).toBeTruthy();
    expect(disconnect).toBeTruthy();
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
      await subscribeCallback(Buffer.from(str));

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
