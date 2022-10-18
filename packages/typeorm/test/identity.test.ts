import "../src";
import { Middleware } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import { TypeormInject, TypeormConnection } from "../src";

class TestMiddleware extends Middleware {
  @TypeormInject("app")
  private readonly appConnection!: TypeormConnection;
  @TypeormInject()
  private readonly coreConnection!: TypeormConnection;

  async invoke(): Promise<void> {
    this.ctx.bag("result", {
      app: !!this.appConnection,
      core: !!this.coreConnection,
      eq: this.appConnection == this.coreConnection,
    });
  }
}

test("identity", async () => {
  const { ctx } = await new TestStartup()
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
    .run();

  expect(ctx.bag("result")).toEqual({
    app: true,
    core: true,
    eq: false,
  });
});
