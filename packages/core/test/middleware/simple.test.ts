import { TestStartup } from "../test-startup";

test("simpple middleware", async () => {
  const startup = new TestStartup()
    .use(async (ctx, next) => {
      ctx.bag("mdw1", "mdw1");
      await next();
    })
    .use(async (ctx, next) => {
      ctx.bag("mdw2", "mdw2");
      await next();
      ctx.bag("mdw4", "mdw4->2");
    })
    .use(async (ctx, next) => {
      ctx.bag("mdw3", "mdw3");
      await next();
    })
    .use(async (ctx, next) => {
      ctx.bag("mdw4", "mdw4");
      await next();
    })
    .use(async (ctx, next) => {
      ctx.bag("mdw5", "mdw5");
      await next();
    })
    .use(async (ctx, next) => {
      ctx.bag("ctx", "OK");
      await next();
    });

  const { ctx } = await startup.run();
  expect(ctx.bag("ctx")).toBe("OK");
  expect(ctx.bag("mdw1")).toBe("mdw1");
  expect(ctx.bag("mdw2")).toBe("mdw2");
  expect(ctx.bag("mdw3")).toBe("mdw3");
  expect(ctx.bag("mdw4")).toBe("mdw4->2");
  expect(ctx.bag("mdw5")).toBe("mdw5");
  expect(ctx.bag("mdw6")).toBeUndefined();
});
