import "../src";
import { Middleware } from "@ipare/core";
import { mongoose, MongooseConnection, Mongoose } from "../src";
import { TestStartup } from "@ipare/testing";

class TestMiddleware extends Middleware {
  @Mongoose("app")
  private readonly appConnection!: MongooseConnection;
  @Mongoose()
  private readonly coreConnection!: MongooseConnection;

  async invoke(): Promise<void> {
    this.ctx.set("result", {
      app: !!this.appConnection,
      core: !!this.coreConnection,
      eq: this.appConnection == this.coreConnection,
    });
  }
}

test("identity", async () => {
  const { ctx } = await new TestStartup()
    .use(async (ctx, next) => {
      (mongoose as any).createConnection = async () => {
        ctx.set("connect", "1");
        return {
          close: () => {
            ctx.set("destroy", "1");
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

  expect(ctx.get("result")).toEqual({
    app: true,
    core: true,
    eq: false,
  });
});
