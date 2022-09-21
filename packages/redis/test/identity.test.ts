import "../src";
import { Middleware } from "@ipare/core";
import { RedisConnection, RedisInject } from "../src";
import { TestStartup } from "@ipare/testing";
import RC from "@redis/client/dist/lib/client";

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
  const res = await new TestStartup()
    .use(async (ctx, next) => {
      RC.prototype.connect = async () => {
        ctx.bag("connect", "1");
      };
      RC.prototype.disconnect = async () => {
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

  expect(res.bag("result")).toEqual({
    app: true,
    core: true,
    eq: false,
  });
});
