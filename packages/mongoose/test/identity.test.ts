import "../src";
import { Middleware } from "@ipare/core";
import { mongoose, MongoConnection } from "../src";
import { TestStartup } from "@ipare/testing";

class TestMiddleware extends Middleware {
  @MongoConnection("app")
  private readonly appConnection!: mongoose.Connection;
  @MongoConnection()
  private readonly coreConnection!: mongoose.Connection;

  async invoke(): Promise<void> {
    this.ok({
      app: !!this.appConnection,
      core: !!this.coreConnection,
      eq: this.appConnection == this.coreConnection,
    });
  }
}

test("identity", async () => {
  const res = await new TestStartup()
    .use(async (ctx, next) => {
      mongoose.Mongoose.prototype.createConnection = async () => {
        ctx.setHeader("connect", "1");
        return {
          close: () => {
            ctx.setHeader("destroy", "1");
          },
        } as any;
      };
      await next();
    })
    .useMongoose("test", {
      identity: "app",
    })
    .useMongoose("test")
    .add(TestMiddleware)
    .run();

  expect(res.body).toEqual({
    app: true,
    core: true,
    eq: false,
  });
});
