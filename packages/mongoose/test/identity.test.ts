import "../src";
import { Middleware } from "@ipare/core";
import { mongoose, MongooseConnection, MongooseInject } from "../src";
import { TestStartup } from "@ipare/testing";

class TestMiddleware extends Middleware {
  @MongooseInject("app")
  private readonly appConnection!: MongooseConnection;
  @MongooseInject()
  private readonly coreConnection!: MongooseConnection;

  async invoke(): Promise<void> {
    this.ctx.bag("result", {
      app: !!this.appConnection,
      core: !!this.coreConnection,
      eq: this.appConnection == this.coreConnection,
    });
  }
}

test("identity", async () => {
  const ctx = await new TestStartup()
    .use(async (ctx, next) => {
      (mongoose as any).createConnection = async () => {
        ctx.bag("connect", "1");
        return {
          close: () => {
            ctx.bag("destroy", "1");
          },
        } as any;
      };
      await next();
    })
    .useMongoose({
      url: "test",
      identity: "app",
    })
    .useMongoose({
      url: "test",
    })
    .add(TestMiddleware)
    .run();

  expect(ctx.bag("result")).toEqual({
    app: true,
    core: true,
    eq: false,
  });
});
