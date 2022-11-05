import "../src";
import { TestStartup } from "@ipare/testing";
import RedisClient from "@redis/client/dist/lib/client";

it("should get redis by ctx", async () => {
  const beforeConnect = RedisClient.prototype.connect;
  RedisClient.prototype.connect = async () => undefined;
  const beforeDisconnect = RedisClient.prototype.disconnect;
  RedisClient.prototype.disconnect = async () => undefined;

  await new TestStartup()
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
    .run();

  RedisClient.prototype.connect = beforeConnect;
  RedisClient.prototype.disconnect = beforeDisconnect;
});
