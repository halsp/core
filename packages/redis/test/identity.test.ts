import "../src";
import { Middleware, Startup } from "@halsp/core";
import { Redis } from "../src";
import "@halsp/testing";
import RedisClient from "@redis/client/dist/lib/client";

class TestMiddleware extends Middleware {
  @Redis("app")
  private readonly appConnection!: Redis;
  @Redis
  private readonly coreConnection!: Redis;
  @Redis()
  private readonly coreConnection2!: Redis;

  async invoke(): Promise<void> {
    expect(this.coreConnection).toBe(this.coreConnection2);

    this.ctx.set("result", {
      app: !!this.appConnection,
      core: !!this.coreConnection,
      eq: this.appConnection == this.coreConnection,
    });
  }
}

test("identity", async () => {
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
      identity: "app",
    })
    .useRedis()
    .add(TestMiddleware)
    .test();

  RedisClient.prototype.connect = beforeConnect;
  RedisClient.prototype.disconnect = beforeDisconnect;

  expect(ctx.get("result")).toEqual({
    app: true,
    core: true,
    eq: false,
  });
});
