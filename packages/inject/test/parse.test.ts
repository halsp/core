import "@halsp/testing";
import "../src";
import { Service2 } from "./services";
import { InjectType } from "../src";
import { Startup } from "@halsp/core";
import { InjectDecoratorParser } from "../src/inject-parser";

test(`inject decorators object`, async function () {
  const { ctx } = await new Startup()
    .keepThrow()
    .useInject()
    .use(async (ctx) => {
      const obj = await ctx.getService(Service2);
      return ctx.set("result", obj.invoke());
    })
    .test();
  expect(ctx.get("result")).toBe("service2.service1");
});

test(`inject decorators`, async function () {
  const { ctx } = await new Startup()
    .keepThrow()
    .useInject()
    .use(async (ctx) => {
      const obj = await ctx.getService(Service2);
      return ctx.set("result", obj.invoke());
    })
    .test();
  expect(ctx.get("result")).toBe("service2.service1");
});

test(`try parse`, async function () {
  const { ctx } = await new Startup()
    .useInject()
    .use(async (ctx) => {
      const obj1 = ctx.getCachedService(Service2);
      const obj2 = await ctx.getService(Service2);
      const obj3 = ctx.getCachedService(Service2);
      return ctx.set("result", {
        obj1: !!obj1,
        obj2: !!obj2,
        obj3: !!obj3,
      });
    })
    .test();
  expect(ctx.get("result")).toEqual({
    obj1: false,
    obj2: true,
    obj3: true,
  });
});

test(`try parse`, async function () {
  const { ctx } = await new Startup()
    .useInject()
    .inject(Service2, InjectType.Transient)
    .use(async (ctx) => {
      const service1 = await ctx.getService(Service2);
      const service2 = await ctx.getService(Service2);
      const svs = new InjectDecoratorParser(ctx).getTransientInstances(
        Service2,
      );
      return ctx.set("result", {
        eq: service1 == service2,
        sv1: svs[0] == service1,
        sv2: svs[1] == service2,
        length: svs.length,
      });
    })
    .test();
  expect(ctx.get("result")).toEqual({
    eq: false,
    length: 2,
    sv1: true,
    sv2: true,
  });
});
