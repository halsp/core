import { MicroRedisStartup } from "../../src/redis";
import RedisClient from "@redis/client/dist/lib/client";
import { getTestOptions } from "./utils";
import { REDIS_DEFAULT_CHANNEL } from "../../src/constant";

describe("startup", () => {
  it("should connect redis", async () => {
    let connect = false;
    let disconnect = false;
    let subscribe = false;
    let unsubscribe = false;
    const beforeConnect = RedisClient.prototype.connect;
    RedisClient.prototype.connect = async () => {
      connect = true;
    };
    const beforeDisconnect = RedisClient.prototype.disconnect;
    RedisClient.prototype.disconnect = async () => {
      disconnect = true;
    };
    const beforeSUBSCRIBE = RedisClient.prototype.SUBSCRIBE;
    RedisClient.prototype.SUBSCRIBE = async () => {
      subscribe = true;
    };
    const beforeUNSUBSCRIBE = RedisClient.prototype.UNSUBSCRIBE;
    RedisClient.prototype.UNSUBSCRIBE = async () => {
      unsubscribe = true;
    };

    const startup = new MicroRedisStartup();
    const { pub, sub } = await startup.listen();
    Object.defineProperty(pub, "isReady", {
      get: () => true,
    });
    Object.defineProperty(sub, "isReady", {
      get: () => true,
    });
    await startup.close();

    RedisClient.prototype.connect = beforeConnect;
    RedisClient.prototype.disconnect = beforeDisconnect;
    RedisClient.prototype.SUBSCRIBE = beforeSUBSCRIBE;
    RedisClient.prototype.UNSUBSCRIBE = beforeUNSUBSCRIBE;

    expect(!!sub).toBeTruthy();
    expect(!!pub).toBeTruthy();
    expect(connect).toBeTruthy();
    expect(disconnect).toBeTruthy();
    expect(subscribe).toBeTruthy();
    expect(unsubscribe).toBeTruthy();
  });

  it("should be error when the message is invalidate", async () => {
    let pattern: any = undefined;
    let data: any = undefined;
    const startup = new MicroRedisStartup(getTestOptions()).use(async (ctx) => {
      pattern = ctx.req.pattern;
      data = ctx.req.body;
    });
    const { pub } = await startup.listen();

    await pub.publish(REDIS_DEFAULT_CHANNEL, `3#{}`);

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
