import "@halsp/testing";
import { parseInject } from "@halsp/inject";
import "../src";
import { Typeorm } from "../src";
import { OPTIONS_IDENTITY } from "../src/constant";
import { Startup } from "@halsp/core";

it("default entities should endswith *.js", async () => {
  delete process.env.TS_JEST;
  await new Startup()
    .useTypeorm({
      type: "sqlite",
      database: "test/sqlite.db",
      synchronize: true,
    })
    .use(async (ctx) => {
      const connection = await parseInject<Typeorm>(ctx, OPTIONS_IDENTITY);
      if (!connection) throw new Error();

      const entity: string = (connection.options.entities as any)[0];
      expect(entity.endsWith("*.js")).toBeTruthy();
    })
    .test();
});

it("test entities should endswith *.ts", async () => {
  process.env.TS_JEST = "1";
  await new Startup()
    .useTypeorm({
      type: "sqlite",
      database: "test/sqlite.db",
      synchronize: true,
    })
    .use(async (ctx) => {
      const connection = await parseInject<Typeorm>(ctx, OPTIONS_IDENTITY);
      if (!connection) throw new Error();

      const entity: string = (connection.options.entities as any)[0];
      expect(entity.endsWith("*.ts")).toBeTruthy();
    })
    .test();
});
