import "../src";
import "@halsp/testing";
import RedisClient from "@redis/client/dist/lib/client";
import { Startup } from "@halsp/core";

it("should get redis by ctx", async () => {
  const beforeConnect = RedisClient.prototype.connect;
  RedisClient.prototype.connect = async () => undefined as any;
  const beforeDisconnect = RedisClient.prototype.disconnect;
  RedisClient.prototype.disconnect = async () => undefined;

  await new Startup()
    .useRedis({
      identity: "abc",
    })
    .useRedis()
    .use(async (ctx, next) => {
      expect(!!(await ctx.getRedis())).toBeTruthy();
      expect(!!(await ctx.getRedis("abc"))).toBeTruthy();
      expect(!!(await ctx.getRedis("def"))).toBeFalsy();

      await next();
    })
    .test();

  RedisClient.prototype.connect = beforeConnect;
  RedisClient.prototype.disconnect = beforeDisconnect;
});
