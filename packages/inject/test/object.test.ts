import { Context, Startup } from "@halsp/core";
import { InjectType } from "../src";
import "@halsp/testing";

export class Service extends Object {
  public count = 0;
}

test(`object`, async function () {
  const { ctx } = await new Startup()
    .useInject()
    .inject(Service, new Service())
    .use(async (ctx) => {
      const service1 = await ctx.getService(Service);
      service1.count++;
      const service2 = await ctx.getService(Service);
      service2.count++;
      ctx.set("result", {
        count1: service1.count,
        count2: service2.count,
      });
    })
    .test();

  expect(ctx.get("result")).toEqual({
    count1: 2,
    count2: 2,
  });
});

export class BuilderService {
  constructor(readonly ctx: Context) {}
  public count = 0;
}
function runBuilderTest(type?: InjectType.Scoped | InjectType.Transient) {
  test(`object builder ${type}`, async function () {
    const { ctx } = await new Startup()
      .useInject()
      .inject(BuilderService, (ctx) => new BuilderService(ctx), type)
      .use(async (ctx) => {
        const service1 = await ctx.getService(BuilderService);
        service1.count++;
        const service2 = await ctx.getService(BuilderService);
        service2.count++;
        ctx.set("result", {
          ctx: service1.ctx == service2.ctx,
          count1: service1.count,
          count2: service2.count,
        });
      })
      .test();

    if (type == InjectType.Transient) {
      expect(ctx.get("result")).toEqual({
        ctx: true,
        count1: 1,
        count2: 1,
      });
    } else {
      expect(ctx.get("result")).toEqual({
        ctx: true,
        count1: 2,
        count2: 2,
      });
    }
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
    const { ctx } = await new Startup()
      .useInject()
      .inject(
        PromiseBuilderService,
        async (ctx) => await PromiseBuilderService.createService(ctx),
        type,
      )
      .use(async (ctx) => {
        const service1 = await ctx.getService(PromiseBuilderService);
        service1.count++;
        const service2 = await ctx.getService(PromiseBuilderService);
        service2.count++;
        ctx.set("result", {
          ctx: service1.ctx == service2.ctx,
          count1: service1.count,
          count2: service2.count,
        });
      })
      .test();

    if (type == InjectType.Transient) {
      expect(ctx.get("result")).toEqual({
        ctx: true,
        count1: 1,
        count2: 1,
      });
    } else {
      expect(ctx.get("result")).toEqual({
        ctx: true,
        count1: 2,
        count2: 2,
      });
    }
  });
}

runPrimiseBuilderTest(InjectType.Singleton);
runPrimiseBuilderTest(InjectType.Scoped);
runPrimiseBuilderTest(InjectType.Transient);
runPrimiseBuilderTest();
