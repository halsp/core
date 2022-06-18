import { TestStartup } from "@sfajs/core";
import "../src";
import { Service2 } from "./services";
import { parseInject } from "../src";

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
