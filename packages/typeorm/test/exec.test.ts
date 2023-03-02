import { TestStartup } from "@halsp/testing";
import { parseInject } from "@halsp/inject";
import "../src";
import { TypeormConnection } from "../src";
import { OPTIONS_IDENTITY } from "../src/constant";
import { TestEntity } from "./entities/TestEntity";

it("should insert entity to sqlite", async () => {
  await new TestStartup()
    .useTypeorm({
      type: "sqlite",
      database: "test/sqlite.db",
      synchronize: true,
      entities: [TestEntity],
    })
    .use(async (ctx) => {
      const connection = await parseInject<TypeormConnection>(
        ctx,
        OPTIONS_IDENTITY
      );
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
    .run();
});
