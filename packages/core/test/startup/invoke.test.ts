import { TestStartup } from "../test-startup";

test("invoke multiple", async () => {
  const startup = new TestStartup()
    .use(async (ctx, next) => {
      if (!ctx.bag("result")) {
        ctx.bag("result", 0);
      }
      ctx.bag("result", ctx.bag<number>("result") + 1);
      await next();
    })
    .use(async (ctx) => {
      ctx.bag("result", ctx.bag<number>("result") + 1);
    });
  let ctx = await startup.run();
  expect(ctx.bag("result")).toBe(2);
  ctx = await startup.run();
  expect(ctx.bag("result")).toBe(2);
  ctx = await startup.run();
  expect(ctx.bag("result")).toBe(2);
});
