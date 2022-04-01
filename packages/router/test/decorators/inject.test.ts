import { SfaRequest, TestStartup } from "@sfajs/core";
import { routerCfg } from "../global";
import "../../src";
import { Service2 } from "../actions/decorator/inject/services";
import { parseInject } from "../../src";

test(`inject decorators`, async function () {
  const res = await new TestStartup(
    new SfaRequest().setPath("/decorator/inject").setMethod("GET")
  )
    .useRouter(routerCfg)
    .run();
  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    service1: "service1",
    service11: "service1",
    service2: "service2.service1",
    singleton1: 4,
    singleton2: 4,
    scopedService: 1,
  });
});

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
