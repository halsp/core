import { TestStartup } from "@ipare/core";
import {
  getTransientInstances,
  InjectType,
  parseInject,
  tryParseInject,
} from "@ipare/inject";
import { typeorm } from "../src";
import "../src";
import { OPTIONS_IDENTITY } from "../src/constant";

it("scoped instance should be destroyed", async () => {
  await new TestStartup()
    .use(async (ctx, next) => {
      await next();
      const dataSource = await parseInject<typeorm.DataSource>(
        ctx,
        OPTIONS_IDENTITY
      );
      expect(dataSource?.isInitialized).toBeFalsy();
    })
    .useTypeorm({
      type: "sqlite",
      database: "test/sqlite.db",
      injectType: InjectType.Scoped,
    })
    .use(async (ctx, next) => {
      const dataSource = await parseInject<typeorm.DataSource>(
        ctx,
        OPTIONS_IDENTITY
      );
      expect(dataSource?.isInitialized).toBeFalsy();
      await next();
    })
    .run();
});

it("transient instance should be destroyed", async () => {
  await new TestStartup()
    .use(async (ctx, next) => {
      await next();
      const dataSource = getTransientInstances<typeorm.DataSource>(
        ctx,
        OPTIONS_IDENTITY
      );
      expect(dataSource.some((item) => !item.isInitialized)).toBeTruthy();
    })
    .useTypeorm({
      type: "sqlite",
      database: "test/sqlite.db",
      injectType: InjectType.Transient,
    })
    .use(async (ctx, next) => {
      const dataSource1 = await parseInject<typeorm.DataSource>(
        ctx,
        OPTIONS_IDENTITY
      );
      const dataSource2 = await parseInject<typeorm.DataSource>(
        ctx,
        OPTIONS_IDENTITY
      );
      expect(dataSource1?.isInitialized).toBeTruthy();
      expect(dataSource2?.isInitialized).toBeTruthy();

      dataSource1?.destroy();
      expect(dataSource1?.isInitialized).toBeFalsy();

      await next();
    })
    .run();
});

it("singleton instance should not be destroyed", async () => {
  await new TestStartup()
    .use(async (ctx, next) => {
      await next();
      const dataSource = await parseInject<typeorm.DataSource>(
        ctx,
        OPTIONS_IDENTITY
      );
      expect(dataSource?.isInitialized).toBeFalsy();
    })
    .useTypeorm({
      type: "sqlite",
      database: "test/sqlite.db",
      injectType: InjectType.Singleton,
      initialize: false,
    })
    .use(async (ctx, next) => {
      const dataSource = await parseInject<typeorm.DataSource>(
        ctx,
        OPTIONS_IDENTITY
      );
      expect(dataSource?.isInitialized).toBeTruthy();
      await next();
    })
    .run();
});

it("instance should be undefined", async () => {
  await new TestStartup()
    .use(async (ctx, next) => {
      await next();
      const dataSource = tryParseInject<typeorm.DataSource>(
        ctx,
        OPTIONS_IDENTITY
      );
      expect(!!dataSource).toBeFalsy();
    })
    .useTypeorm({
      type: "sqlite",
      database: "test/sqlite.db",
    })
    .run();
});
