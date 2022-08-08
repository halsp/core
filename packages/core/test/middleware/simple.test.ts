import { TestStartup } from "../test-startup";

test("simpple middleware", async () => {
  const startup = new TestStartup()
    .use(async (ctx, next) => {
      ctx.res.setHeader("mdw1", "mdw1");
      await next();
    })
    .use(async (ctx, next) => {
      ctx.res.setHeader("mdw2", "mdw2");
      await next();
      ctx.res.setHeader("mdw4", "mdw4->2");
    })
    .use(async (ctx, next) => {
      ctx.res.setHeader("mdw3", "mdw3");
      await next();
    })
    .use(async (ctx, next) => {
      ctx.res.setHeader("mdw4", "mdw4");
      await next();
    })
    .use(async (ctx, next) => {
      ctx.res.setHeader("mdw5", "mdw5");
      await next();
    })
    .use(async (ctx, next) => {
      ctx.ok("OK");
      await next();
    });

  const result = await startup.run();
  expect(result.status).toBe(200);
  expect(result.body).toBe("OK");
  expect(result.getHeader("mdw1")).toBe("mdw1");
  expect(result.getHeader("mdw2")).toBe("mdw2");
  expect(result.getHeader("mdw3")).toBe("mdw3");
  expect(result.getHeader("mdw4")).toBe("mdw4->2");
  expect(result.getHeader("mdw5")).toBe("mdw5");
  expect(result.getHeader("mdw6")).toBeUndefined();
});
