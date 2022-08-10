import "../src";
import { Middleware } from "@ipare/core";
import { redis, RedisClient } from "../src";
import { TestStartup } from "@ipare/testing";
import RC from "@redis/client/dist/lib/client";

class TestMiddleware extends Middleware {
  @RedisClient("app")
  private readonly appDataSource!: redis.RedisClientType;
  @RedisClient()
  private readonly coreDataSource!: redis.RedisClientType;

  async invoke(): Promise<void> {
    this.ok({
      app: !!this.appDataSource,
      core: !!this.coreDataSource,
      eq: this.appDataSource == this.coreDataSource,
    });
  }
}

test("identity", async () => {
  const res = await new TestStartup()
    .use(async (ctx, next) => {
      RC.prototype.connect = async () => {
        ctx.setHeader("connect", "1");
      };
      RC.prototype.disconnect = async () => {
        ctx.setHeader("disconnect", "1");
      };
      await next();
    })
    .useRedis({
      identity: "app",
    })
    .useRedis()
    .add(TestMiddleware)
    .run();

  expect(res.body).toEqual({
    app: true,
    core: true,
    eq: false,
  });
});
