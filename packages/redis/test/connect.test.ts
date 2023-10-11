import "../src";
import "@halsp/testing";
import { Redis } from "../src";
import { OPTIONS_IDENTITY } from "../src/constant";
import RedisClient from "@redis/client/dist/lib/client";
import { Startup } from "@halsp/core";

test("connect failed", async () => {
  const beforeConnect = RedisClient.prototype.connect;
  const beforeDisconnect = RedisClient.prototype.disconnect;

  const { ctx } = await new Startup()
    .use(async (ctx, next) => {
      RedisClient.prototype.connect = async () => {
        ctx.set("connect", "1");
        return undefined as any;
      };
      RedisClient.prototype.disconnect = async () => {
        ctx.set("disconnect", "1");
      };
      await next();
    })
    .useRedis({
      url: "redis://test",
    })
    .use(async (ctx) => {
      const connection = await ctx.getService<Redis>(OPTIONS_IDENTITY);
      if (!connection) throw new Error();

      Object.defineProperty(connection, "isOpen", {
        get: () => true,
      });
    })
    .test();

  RedisClient.prototype.connect = beforeConnect;
  RedisClient.prototype.disconnect = beforeDisconnect;

  expect(ctx.get("connect")).toBe("1");
  expect(ctx.get("disconnect")).toBe("1");
});
