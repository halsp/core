import { TestStartup } from "@ipare/core";
import {
  getTransientInstances,
  InjectType,
  parseInject,
  tryParseInject,
} from "@ipare/inject";
import { winston } from "../src";
import "../src";
import { OPTIONS_IDENTITY } from "../src/constant";

it("scoped instance should be destroyed", async () => {
  await new TestStartup()
    .use(async (ctx, next) => {
      await next();
      const logger = await parseInject<winston.Logger>(ctx, OPTIONS_IDENTITY);
      expect(logger?.destroyed).toBeTruthy();
    })
    .useLogger({
      injectType: InjectType.Scoped,
    })
    .use(async (ctx, next) => {
      const logger = await parseInject<winston.Logger>(ctx, OPTIONS_IDENTITY);
      expect(logger?.destroyed).toBeFalsy();
      await next();
    })
    .run();
});

it("transient instance should be destroyed", async () => {
  await new TestStartup()
    .use(async (ctx, next) => {
      await next();
      const loggers = getTransientInstances<winston.Logger>(
        ctx,
        OPTIONS_IDENTITY
      );
      expect(loggers.some((item) => !item.destroyed)).toBeFalsy();
    })
    .useLogger({
      injectType: InjectType.Transient,
    })
    .use(async (ctx, next) => {
      const logger1 = await parseInject<winston.Logger>(ctx, OPTIONS_IDENTITY);
      const logger2 = await parseInject<winston.Logger>(ctx, OPTIONS_IDENTITY);
      expect(logger1?.destroyed).toBeFalsy();
      expect(logger2?.destroyed).toBeFalsy();

      logger1?.destroy();
      expect(logger1?.destroyed).toBeTruthy();

      await next();
    })
    .run();
});

it("singleton instance should not be destroyed", async () => {
  await new TestStartup()
    .use(async (ctx, next) => {
      await next();
      const logger = await parseInject<winston.Logger>(ctx, OPTIONS_IDENTITY);
      expect(logger?.destroyed).toBeTruthy();
    })
    .useLogger({
      injectType: InjectType.Singleton,
    })
    .use(async (ctx, next) => {
      const logger = await parseInject<winston.Logger>(ctx, OPTIONS_IDENTITY);
      expect(logger?.destroyed).toBeFalsy();
      await next();
    })
    .run();
});

it("instance should be undefined", async () => {
  await new TestStartup()
    .use(async (ctx, next) => {
      await next();
      const logger = tryParseInject<winston.Logger>(ctx, OPTIONS_IDENTITY);
      expect(!!logger).toBeFalsy();
    })
    .useLogger()
    .run();
});
