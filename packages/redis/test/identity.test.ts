import "../src";
import { Middleware } from "@ipare/core";
import { RedisConnection, RedisInject } from "../src";
import { TestStartup } from "@ipare/testing";
import RedisClient from "@redis/client/dist/lib/client";

class TestMiddleware extends Middleware {
  @RedisInject("app")
  private readonly appConnection!: RedisConnection;
  @RedisInject()
  private readonly coreConnection!: RedisConnection;

  async invoke(): Promise<void> {
    this.ctx.bag("result", {
      app: !!this.appConnection,
      core: !!this.coreConnection,
      eq: this.appConnection == this.coreConnection,
    });
  }
}

test("identity", async () => {
  const beforeConnect = RedisClient.prototype.connect;
  const beforeDisconnect = RedisClient.prototype.disconnect;

  const { ctx } = await new TestStartup()
    .use(async (ctx, next) => {
      RedisClient.prototype.connect = async () => {
        ctx.bag("connect", "1");
      };
      RedisClient.prototype.disconnect = async () => {
        ctx.bag("disconnect", "1");
      };
      await next();
    })
    .useRedis({
      identity: "app",
    })
    .useRedis()
    .add(TestMiddleware)
    .run();

  RedisClient.prototype.connect = beforeConnect;
  RedisClient.prototype.disconnect = beforeDisconnect;

  expect(ctx.bag("result")).toEqual({
    app: true,
    core: true,
    eq: false,
  });
});
