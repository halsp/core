import { TestStartup } from "@sfajs/core";
import { parseInject } from "../src";

export class Service extends Object {
  public count = 0;
}

test(`inject object`, async function () {
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
