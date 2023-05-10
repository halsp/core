import "../src";
import { Middleware, Startup } from "@halsp/core";
import "@halsp/testing";
import { Knex } from "../src";

describe("identity", () => {
  class TestMiddleware extends Middleware {
    @Knex("app")
    private readonly appConnection!: Knex;
    @Knex()
    private readonly coreConnection!: Knex;

    async invoke(): Promise<void> {
      this.ctx.set("result", {
        app: !!this.appConnection,
        core: !!this.coreConnection,
        eq: this.appConnection == this.coreConnection,
        eq2: this.appConnection == (await this.ctx.getKnex("app")),
        eq3: this.coreConnection == (await this.ctx.getKnex()),
      });
    }
  }

  it("identity", async () => {
    const { ctx } = await new Startup()
      .useKnex({
        identity: "app",
        client: "sqlite3",
        connection: {
          filename: "./node_modules/test.db",
        },
      })
      .useKnex({
        client: "sqlite3",
        connection: {
          filename: "./node_modules/test.db",
        },
      })
      .add(TestMiddleware)
      .test();

    expect(ctx.get("result")).toEqual({
      app: true,
      core: true,
      eq: false,
      eq2: true,
      eq3: true,
    });
  });
});
