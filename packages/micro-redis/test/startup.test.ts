import "../src";
import { MicroRedisClient } from "@halsp/micro-redis-client";
import { Startup } from "@halsp/core";

describe("startup", () => {
  it("should subscribe and publish", async () => {
    const startup = new Startup()
      .useMicroRedis({
        url: "redis://127.0.0.1:6003",
      })
      .useMicroRedis()
      .register("test_pattern", (ctx) => {
        ctx.res.body = ctx.req.body;
      });
    await startup.listen();

    const client = new MicroRedisClient({
      url: "redis://127.0.0.1:6003",
    });
    await client["connect"]();
    const result = await client.send("test_pattern", "test_body");

    await client.dispose();
    await startup.close();
    await startup.close();

    expect(startup.pub).toBeUndefined();
    expect(startup.sub).toBeUndefined();
    expect(result).toBe("test_body");
  }, 20000);

  function testPub(isPubUndefined: boolean) {
    it(`should not publish when pub is undefined ${isPubUndefined}`, async () => {
      let publishPattern = "";
      let subscribePattern = "";
      let subscribeCallback: any;
      const startup = new Startup().useMicroRedis({
        url: "redis://127.0.0.1:6003",
      });
      await startup.listen();

      const sub = (startup as any).sub;
      const subscribe = sub.subscribe;
      sub.subscribe = (pattern: string, callback: any, ...args: any[]) => {
        subscribePattern = pattern;
        subscribeCallback = callback;
        return subscribe.bind(sub)(pattern, callback, ...args);
      };

      const pub = (startup as any).pub;
      const publish = pub.publish;
      pub.publish = (pattern: string, ...args: any[]) => {
        publishPattern = pattern;
        return publish.bind(pub)(pattern, ...args);
      };

      startup.register("test_pattern");

      const str = JSON.stringify({
        id: "123",
        data: "d",
        pattern: "pt",
      });

      if (isPubUndefined) {
        await startup.pub.disconnect();
        Object.defineProperty(startup, "pub", {
          configurable: true,
          enumerable: true,
          get: () => undefined,
        });
      }
      await subscribeCallback(Buffer.from(str));

      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 500);
      });
      await startup.close();
      expect(subscribePattern).toBe("test_pattern");
      expect(publishPattern).toBe(isPubUndefined ? "" : "test_pattern.123");
    });
  }

  testPub(true);
  testPub(false);
});

describe("options", () => {
  it("should not connect with default options", async () => {
    const startup = new Startup().useMicroRedis();

    let error: any;
    try {
      await startup.listen();
    } catch (err) {
      error = err;
    }

    expect(!!error).toBeTruthy();
  });
});
