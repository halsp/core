import "../src";
import { TestStartup } from "@ipare/testing";
import RedisClient from "@redis/client/dist/lib/client";

it("should get redis by ctx", async () => {
  await new TestStartup()
    .use(async (ctx, next) => {
      RedisClient.prototype.connect = async () => undefined;
      RedisClient.prototype.disconnect = async () => undefined;
      await next();
    })
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
});
