import { MicroRedisStartup } from "../../src/redis";
import RedisClient from "@redis/client/dist/lib/client";
import { REDIS_CHANNEL } from "../../src/constant";

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
    const subClient = await startup.listen();
    await startup.close();
    expect(!!subClient).toBeTruthy();
    expect(subClient).toBe(startup.subClient);
    expect(connect).toBeTruthy();
    expect(disconnect).toBeTruthy();
    expect(subscribe).toBeTruthy();
    expect(unsubscribe).toBeTruthy();

    RedisClient.prototype.connect = beforeConnect;
    RedisClient.prototype.disconnect = beforeDisconnect;
    RedisClient.prototype.SUBSCRIBE = beforeSUBSCRIBE;
    RedisClient.prototype.UNSUBSCRIBE = beforeUNSUBSCRIBE;
  });

  it("should connect redis", async () => {
    let pattern: any = undefined;
    let data: any = undefined;
    const startup = new MicroRedisStartup({
      host: "redis-18129.c56.east-us.azure.cloud.redislabs.com",
      port: 18129,
      username: "default",
      password: "zOxXE0nkIdMjk2KhGkjFwIMNFamHmXiH",
    }).use(async (ctx) => {
      pattern = ctx.req.pattern;
      data = ctx.req.body;
    });
    await startup.listen();

    await startup.pubClient.publish(
      "@ipare/micro/redis",
      `40#{"pattern":"pt","data":"abc","id":"123"}`
    );

    let times = 0;
    while (times < 20 && !pattern) {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 100);
      });
      times++;
    }

    expect(pattern).toBe(`pt`);
    expect(data).toBe(`abc`);

    await startup.close();
  });

  it("should be error when the message is invalidate", async () => {
    let pattern: any = undefined;
    let data: any = undefined;
    const startup = new MicroRedisStartup({
      host: "redis-18129.c56.east-us.azure.cloud.redislabs.com",
      port: 18129,
      username: "default",
      password: "zOxXE0nkIdMjk2KhGkjFwIMNFamHmXiH",
    }).use(async (ctx) => {
      pattern = ctx.req.pattern;
      data = ctx.req.body;
    });
    await startup.listen();

    await startup.pubClient.publish(REDIS_CHANNEL, `3#{}`);

    let times = 0;
    while (times < 20 && !pattern) {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 100);
      });
      times++;
    }

    expect(pattern).toBeUndefined();
    expect(data).toBeUndefined();

    await startup.close();
  });
});
