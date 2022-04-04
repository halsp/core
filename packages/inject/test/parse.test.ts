import { TestStartup } from "@sfajs/core";
import "../src";
import { Service2 } from "./services";
import { parseInject } from "../src";

test(`inject decorators object`, async function () {
  const res = await new TestStartup()
    .use((ctx) => {
      const obj = parseInject(ctx, Service2);
      return ctx.ok(obj.invoke());
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.body).toBe("service2.service1");
});

test(`inject decorators`, async function () {
  const res = await new TestStartup()
    .use((ctx) => {
      const obj = parseInject(ctx, Service2);
      return ctx.ok(obj.invoke());
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.body).toBe("service2.service1");
});