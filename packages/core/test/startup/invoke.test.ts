import { SfaRequest, TestStartup } from "../../src";

test("invoke multiple", async () => {
  const startup = new TestStartup(new SfaRequest())
    .use(async (ctx, next) => {
      if (!ctx.res.body) {
        ctx.res.body = 0;
      }
      (ctx.res.body as number)++;
      await next();
    })
    .use(async (ctx) => {
      (ctx.res.body as number)++;
    });
  let res = await startup.run();
  expect(res.body).toBe(2);
  res = await startup.run();
  expect(res.body).toBe(2);
  res = await startup.run();
  expect(res.body).toBe(2);
});
