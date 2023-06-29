import "../src";
import { Middleware, Startup } from "@halsp/core";
import { Mongoose } from "../src";
import "@halsp/testing";
import mongoose from "mongoose";

class TestMiddleware extends Middleware {
  @Mongoose("app")
  private readonly appConnection!: Mongoose;
  @Mongoose
  private readonly coreConnection!: Mongoose;
  @Mongoose()
  private readonly coreConnection2!: Mongoose;

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
  const { ctx } = await new Startup()
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
    .test();

  expect(ctx.get("result")).toEqual({
    app: true,
    core: true,
    eq: false,
  });
});
