import { MicroRedisStartup } from "../src";
import { MicroRedisClient } from "@halsp/micro-redis-client";

describe("startup", () => {
  it("should subscribe and publish", async () => {
    const startup = new MicroRedisStartup({
      url: "redis://127.0.0.1:6003",
    }).register("test_pattern", (ctx) => {
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

    expect(result).toBe("test_body");
  }, 20000);

  it("should not publish when pub is undefined", async () => {
    async function test(isPubUndefined: boolean) {
      let publishPattern = "";
      let subscribePattern = "";
      let subscribeCallback: any;
      const startup = new MicroRedisStartup({
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
        await (startup as any).pub.disconnect();
        (startup as any).pub = undefined;
      }
      await subscribeCallback(Buffer.from(str));

      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 500);
      });
      await startup.close();
      expect(subscribePattern).toBe("test_pattern");
      expect(publishPattern).toBe(isPubUndefined ? "" : "test_pattern.123");
    }

    await test(true);
    await test(false);
  });
});

describe("options", () => {
  it("should not connect with default options", async () => {
    const startup = new MicroRedisStartup();

    let error: any;
    try {
      await startup.listen();
    } catch (err) {
      error = err;
    }

    expect(!!error).toBeTruthy();
  });
});
