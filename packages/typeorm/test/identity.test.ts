import "../src";
import { Middleware } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import { DataSource, typeorm } from "../src";

class TestMiddleware extends Middleware {
  @DataSource("app")
  private readonly appDataSource!: typeorm.DataSource;
  @DataSource()
  private readonly coreDataSource!: typeorm.DataSource;

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
      initialize: false,
    })
    .useTypeorm({
      type: "sqlite",
      database: "test/sqlite.db",
      initialize: false,
    })
    .add(TestMiddleware)
    .run();

  expect(res.body).toEqual({
    app: true,
    core: true,
    eq: false,
  });
});
