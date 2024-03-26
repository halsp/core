import { MicroRedisClient } from "../src";
import { Startup } from "@halsp/core";
import "../src/server";

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

    expect(result).toBe("test_body");
  }, 20000);

  function testPub(isPubClosed: boolean) {
    it(`should not publish when pub is closed ${isPubClosed}`, async () => {
      let publishPattern = "";
      let subscribePattern = "";
      let subscribeCallback: any;
      const startup = new Startup().useMicroRedis({
        url: "redis://127.0.0.1:6003",
      });
      const { sub, pub } = await startup.listen();

      const subscribe = sub.subscribe;
      (sub as any).subscribe = (
        pattern: string,
        callback: any,
        ...args: any[]
      ) => {
        subscribePattern = pattern;
        subscribeCallback = callback;
        return subscribe.bind(sub)(pattern, callback, ...args);
      };

      const publish = pub.publish as any;
      (pub as any).publish = async (pattern: string, ...args: any[]) => {
        publishPattern = pattern;

        let error: any;
        try {
          return await publish.call(pub, pattern, ...args);
        } catch (err) {
          error = err;
        }
        expect(!!error).toBe(isPubClosed);
        return undefined;
      };

      startup.register("test_pattern");

      const str = JSON.stringify({
        id: "123",
        data: "d",
        pattern: "pt",
      });

      if (isPubClosed) {
        await pub.disconnect();
      }
      await subscribeCallback(Buffer.from(str));

      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 500);
      });
      await startup.close();
      expect(subscribePattern).toBe("test_pattern");
      expect(publishPattern).toBe("test_pattern.123");
    });
  }

  testPub(true);
  testPub(false);
});

describe("options", () => {
  it("should not connect with default options", async () => {
    const startup = new Startup().useMicroRedis();
    expect(startup.listen()).rejects.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }, 10000);
});
