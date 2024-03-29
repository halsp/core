import "@halsp/testing";
import "../src";
import { Typeorm } from "../src";
import { OPTIONS_IDENTITY } from "../src/constant";
import { TestEntity } from "./entities/TestEntity";
import { Startup } from "@halsp/core";

it("should insert entity to sqlite", async () => {
  await new Startup()
    .useTypeorm({
      type: "sqlite",
      database: "test/sqlite.db",
      synchronize: true,
      entities: [TestEntity],
    })
    .use(async (ctx) => {
      const connection = await ctx.getService<Typeorm>(OPTIONS_IDENTITY);
      if (!connection) throw new Error();

      const testDto = new TestEntity();
      testDto.name = "test";
      await connection.manager.save(testDto);
      const findResult = await connection.getRepository(TestEntity).findOne({
        where: {
          name: "test",
        },
      });
      expect(!!findResult).toBeTruthy();
    })
    .test();
});
