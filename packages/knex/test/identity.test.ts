import "../src";
import { Middleware } from "@halsp/common";
import { TestStartup } from "@halsp/testing";
import { Knex, knex } from "../src";

describe("identity", () => {
  class TestMiddleware extends Middleware {
    @Knex("app")
    private readonly appConnection!: knex.Knex;
    @Knex()
    private readonly coreConnection!: knex.Knex;

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
    const { ctx } = await new TestStartup()
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
      .run();

    expect(ctx.get("result")).toEqual({
      app: true,
      core: true,
      eq: false,
      eq2: true,
      eq3: true,
    });
  });
});
