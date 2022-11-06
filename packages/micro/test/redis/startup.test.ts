import { MicroRedisClient, MicroRedisStartup } from "../../src/redis";
import RedisClient from "@redis/client/dist/lib/client";
import { mockConnection, mockConnectionFrom } from "./utils";

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
    const startup = new MicroRedisStartup()
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
    mockConnection.bind(startup)();
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

  it("should not publish message when disconnect", async () => {
    const startup = new MicroRedisStartup()
      .use((ctx) => {
        ctx.res.setBody(ctx.req.body);
        expect(ctx.bag("pt")).toBeTruthy();
      })
      .pattern("test_return", (ctx) => {
        ctx.bag("pt", true);
      });
    mockConnection.bind(startup)();
    await startup.listen();

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        resolve();
      }, 500);
    });

    const client = new MicroRedisClient();
    mockConnectionFrom.bind(client)(startup);
    await client.connect();

    (startup as any).pub = undefined;

    const waitResult = await new Promise<boolean>(async (resolve) => {
      setTimeout(() => {
        resolve(false);
      }, 2000);
      await client.send("test_return", true);
      resolve(true);
    });

    await startup.close();
    await client.dispose();

    expect(waitResult).toBeFalsy();
  }, 10000);
});
