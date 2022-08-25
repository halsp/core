import "../src";
import { Middleware } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import { TypeormInject, TypeormConnection } from "../src";

class TestMiddleware extends Middleware {
  @TypeormInject("app")
  private readonly appDataSource!: TypeormConnection;
  @TypeormInject()
  private readonly coreDataSource!: TypeormConnection;

  async invoke(): Promise<void> {
    this.ok({
      app: !!this.appDataSource,
      core: !!this.coreDataSource,
      eq: this.appDataSource == this.coreDataSource,
    });
  }
}

test("identity", async () => {
  const res = await new TestStartup()
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

  expect(res.body).toEqual({
    app: true,
    core: true,
    eq: false,
  });
});
