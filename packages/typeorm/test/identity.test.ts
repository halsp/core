import "../src";
import { Middleware, Startup } from "@halsp/core";
import "@halsp/testing";
import { Typeorm } from "../src";

class TestMiddleware extends Middleware {
  @Typeorm("app")
  private readonly appConnection!: Typeorm;
  @Typeorm
  private readonly coreConnection!: Typeorm;
  @Typeorm()
  private readonly coreConnection2!: Typeorm;

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
    .useTypeorm({
      identity: "app",
      type: "sqlite",
      database: "test/sqlite.db",
    })
    .useTypeorm({
      type: "sqlite",
      database: "test/sqlite.db",
    })
    .add(TestMiddleware)
    .test();

  expect(ctx.get("result")).toEqual({
    app: true,
    core: true,
    eq: false,
  });
});
