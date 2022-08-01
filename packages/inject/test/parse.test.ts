import { TestStartup } from "@ipare/core";
import "../src";
import { Service2 } from "./services";
import { parseInject, tryParseInject } from "../src";

test(`inject decorators object`, async function () {
  const res = await new TestStartup()
    .use(async (ctx) => {
      const obj = await parseInject(ctx, Service2);
      return ctx.ok(obj.invoke());
    })
    .run();
  expect(res.body).toBe("service2.service1");
  expect(res.status).toBe(200);
});

test(`inject decorators`, async function () {
  const res = await new TestStartup()
    .use(async (ctx) => {
      const obj = await parseInject(ctx, Service2);
      return ctx.ok(obj.invoke());
    })
    .run();
  expect(res.body).toBe("service2.service1");
  expect(res.status).toBe(200);
});

test(`try parse`, async function () {
  const res = await new TestStartup()
    .useInject()
    .use(async (ctx) => {
      const obj1 = await tryParseInject(ctx, Service2);
      const obj2 = await parseInject(ctx, Service2);
      const obj3 = await tryParseInject(ctx, Service2);
      return ctx.ok({
        obj1: !!obj1,
        obj2: !!obj2,
        obj3: !!obj3,
      });
    })
    .run();
  expect(res.body).toEqual({
    obj1: false,
    obj2: true,
    obj3: true,
  });
  expect(res.status).toBe(200);
});
