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
      ctx.bag("result", "OK");
      await next();
    });

  const result = await startup.run();
  expect(result.bag("result")).toBe("OK");
  expect(result.bag("mdw1")).toBe("mdw1");
  expect(result.bag("mdw2")).toBe("mdw2");
  expect(result.bag("mdw3")).toBe("mdw3");
  expect(result.bag("mdw4")).toBe("mdw4->2");
  expect(result.bag("mdw5")).toBe("mdw5");
  expect(result.bag("mdw6")).toBeUndefined();
});
