import { HttpContext, TestStartup } from "@sfajs/core";
import { InjectType, parseInject } from "../src";
import "../src";

export class Service extends Object {
  public count = 0;
}

test(`object`, async function () {
  const res = await new TestStartup()
    .useInject()
    .inject(Service, new Service())
    .use((ctx) => {
      const service1 = parseInject(ctx, Service);
      service1.count++;
      const service2 = parseInject(ctx, Service);
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
  constructor(readonly ctx: HttpContext) {}
  public count = 0;
}
function runBuilderTest(type?: InjectType.Scoped | InjectType.Transient) {
  test(`object builder ${type}`, async function () {
    const res = await new TestStartup()
      .useInject()
      .inject(BuilderService, (ctx) => new BuilderService(ctx), type)
      .use((ctx) => {
        const service1 = parseInject(ctx, BuilderService);
        service1.count++;
        const service2 = parseInject(ctx, BuilderService);
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
