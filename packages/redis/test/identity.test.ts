import "../src";
import { Middleware } from "@ipare/core";
import { redis, RedisClient } from "../src";
import { TestStartup } from "@ipare/testing";

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
    .useRedis({
      identity: "app",
      connect: false,
    })
    .useRedis({
      connect: false,
    })
    .add(TestMiddleware)
    .run();

  expect(res.body).toEqual({
    app: true,
    core: true,
    eq: false,
  });
});
