import "../src";
import { Middleware } from "@halsp/core";
import { mongoose, Mongoose } from "../src";
import { TestStartup } from "@halsp/testing";

class TestMiddleware extends Middleware {
  @Mongoose("app")
  private readonly appConnection!: Mongoose;
  @Mongoose()
  private readonly coreConnection!: Mongoose;

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
