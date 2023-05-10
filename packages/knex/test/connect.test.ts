import "../src";
import "@halsp/testing";
import { parseInject } from "@halsp/inject";
import { OPTIONS_IDENTITY } from "../src/constant";
import { Knex } from "../src";
import { Startup } from "@halsp/core";

describe("connect", () => {
  it("insert and select", async () => {
    await new Startup()
      .useKnex({
        client: "sqlite3",
        connection: {
          filename: "./node_modules/test.db",
        },
      })
      .use(async (ctx) => {
        const connection = await parseInject<Knex>(ctx, OPTIONS_IDENTITY);
        if (!connection) throw new Error();

        const tableName = "destroy_test";
        if (await connection.schema.hasTable(tableName)) {
          await connection.schema.dropTable(tableName);
        }
        await connection.schema.createTable(tableName, (table) => {
          table.increments();
          table.string("name");
          table.timestamps();
        });

        await connection.table(tableName).insert({
          name: "t1",
        });
        const result = await connection.table(tableName).select("*");
        expect(result).toEqual([
          {
            id: 1,
            name: "t1",
            created_at: null,
            updated_at: null,
          },
        ]);
      })
      .test();
  });
});
