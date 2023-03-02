import { TestStartup } from "@halsp/testing";
import "../src";
import { Service2 } from "./services";
import {
  getTransientInstances,
  InjectType,
  parseInject,
  tryParseInject,
} from "../src";

test(`inject decorators object`, async function () {
  const { ctx } = await new TestStartup()
    .use(async (ctx) => {
      const obj = await parseInject(ctx, Service2);
      return ctx.set("result", obj.invoke());
    })
    .run();
  expect(ctx.get("result")).toBe("service2.service1");
});

test(`inject decorators`, async function () {
  const { ctx } = await new TestStartup()
    .use(async (ctx) => {
      const obj = await parseInject(ctx, Service2);
      return ctx.set("result", obj.invoke());
    })
    .run();
  expect(ctx.get("result")).toBe("service2.service1");
});

test(`try parse`, async function () {
  const { ctx } = await new TestStartup()
    .useInject()
    .use(async (ctx) => {
      const obj1 = tryParseInject(ctx, Service2);
      const obj2 = await parseInject(ctx, Service2);
      const obj3 = tryParseInject(ctx, Service2);
      return ctx.set("result", {
        obj1: !!obj1,
        obj2: !!obj2,
        obj3: !!obj3,
      });
    })
    .run();
  expect(ctx.get("result")).toEqual({
    obj1: false,
    obj2: true,
    obj3: true,
  });
});

test(`try parse`, async function () {
  const { ctx } = await new TestStartup()
    .useInject()
    .inject(Service2, InjectType.Transient)
    .use(async (ctx) => {
      const service1 = await parseInject(ctx, Service2);
      const service2 = await parseInject(ctx, Service2);
      const svs = getTransientInstances(ctx, Service2);
      return ctx.set("result", {
        eq: service1 == service2,
        sv1: svs[0] == service1,
        sv2: svs[1] == service2,
        length: svs.length,
      });
    })
    .run();
  expect(ctx.get("result")).toEqual({
    eq: false,
    length: 2,
    sv1: true,
    sv2: true,
  });
});
