import { MicroRedisStartup } from "../../src/redis";
import RedisClient from "@redis/client/dist/lib/client";
import { testOptions } from "./utils";

describe("startup", () => {
  it("should connect redis", async () => {
    let connect = false;
    let disconnect = false;
    const beforeConnect = RedisClient.prototype.connect;
    RedisClient.prototype.connect = async () => {
      connect = true;
    };
    const beforeDisconnect = RedisClient.prototype.disconnect;
    RedisClient.prototype.disconnect = async () => {
      disconnect = true;
    };

    const startup = new MicroRedisStartup();
    const { pub, sub } = await startup.listen();
    Object.defineProperty(pub, "isReady", {
      get: () => true,
    });
    Object.defineProperty(pub, "isOpen", {
      get: () => true,
    });
    Object.defineProperty(sub, "isReady", {
      get: () => true,
    });
    Object.defineProperty(sub, "isOpen", {
      get: () => true,
    });
    await startup.close();

    RedisClient.prototype.connect = beforeConnect;
    RedisClient.prototype.disconnect = beforeDisconnect;

    expect(!!sub).toBeTruthy();
    expect(!!pub).toBeTruthy();
    expect(connect).toBeTruthy();
    expect(disconnect).toBeTruthy();
  });

  it("should be error when the message is invalidate", async () => {
    let pattern: any = undefined;
    let data: any = undefined;
    const startup = new MicroRedisStartup(testOptions)
      .use(async (ctx) => {
        pattern = ctx.req.pattern;
        data = ctx.req.body;
        expect(ctx.bag("pt")).toBeTruthy();
      })
      .patterns({
        pattern: "test_invalidate",
        handler: (ctx) => {
          ctx.bag("pt", true);
        },
      });
    const { pub } = await startup.listen();

    await pub.publish("test_invalidate", `3#{}`);

    let times = 0;
    while (times < 20 && !pattern) {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 100);
      });
      times++;
    }

    await startup.close();
    expect(pattern).toBeUndefined();
    expect(data).toBeUndefined();
  });
});
