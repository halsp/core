import { Context } from "@ipare/core";
import { InjectType, parseInject } from "../src";
import "../src";
import { TestStartup } from "@ipare/testing";

export class Service extends Object {
  public count = 0;
}

test(`object`, async function () {
  const res = await new TestStartup()
    .useInject()
    .inject(Service, new Service())
    .use(async (ctx) => {
      const service1 = await parseInject(ctx, Service);
      service1.count++;
      const service2 = await parseInject(ctx, Service);
      service2.count++;
      ctx.ok({
        count1: service1.count,
        count2: service2.count,
      });
    })
    .run();

  expect(res.body).toEqual({
    count1: 2,
    count2: 2,
  });
  expect(res.status).toBe(200);
});

export class BuilderService {
  constructor(readonly ctx: Context) {}
  public count = 0;
}
function runBuilderTest(type?: InjectType.Scoped | InjectType.Transient) {
  test(`object builder ${type}`, async function () {
    const res = await new TestStartup()
      .useInject()
      .inject(BuilderService, (ctx) => new BuilderService(ctx), type)
      .use(async (ctx) => {
        const service1 = await parseInject(ctx, BuilderService);
        service1.count++;
        const service2 = await parseInject(ctx, BuilderService);
        service2.count++;
        ctx.ok({
          ctx: service1.ctx == service2.ctx,
          count1: service1.count,
          count2: service2.count,
        });
      })
      .run();

    if (type == InjectType.Transient) {
      expect(res.body).toEqual({
        ctx: true,
        count1: 1,
        count2: 1,
      });
    } else {
      expect(res.body).toEqual({
        ctx: true,
        count1: 2,
        count2: 2,
      });
    }
    expect(res.status).toBe(200);
  });
}

runBuilderTest(InjectType.Scoped);
runBuilderTest(InjectType.Transient);
runBuilderTest();

export class PromiseBuilderService {
  constructor(readonly ctx: Context) {}
  public static createService(ctx: Context) {
    return new Promise<PromiseBuilderService>((resolve) => {
      setTimeout(() => {
        resolve(new PromiseBuilderService(ctx));
      }, 200);
    });
  }
  public count = 0;
}

function runPrimiseBuilderTest(type?: InjectType) {
  test(`object primise builder ${type}`, async function () {
    const res = await new TestStartup()
      .useInject()
      .inject(
        PromiseBuilderService,
        async (ctx) => await PromiseBuilderService.createService(ctx),
        type
      )
      .use(async (ctx) => {
        const service1 = await parseInject(ctx, PromiseBuilderService);
        service1.count++;
        const service2 = await parseInject(ctx, PromiseBuilderService);
        service2.count++;
        ctx.ok({
          ctx: service1.ctx == service2.ctx,
          count1: service1.count,
          count2: service2.count,
        });
      })
      .run();

    if (type == InjectType.Transient) {
      expect(res.body).toEqual({
        ctx: true,
        count1: 1,
        count2: 1,
      });
    } else {
      expect(res.body).toEqual({
        ctx: true,
        count1: 2,
        count2: 2,
      });
    }
    expect(res.status).toBe(200);
  });
}

runPrimiseBuilderTest(InjectType.Singleton);
runPrimiseBuilderTest(InjectType.Scoped);
runPrimiseBuilderTest(InjectType.Transient);
runPrimiseBuilderTest();
