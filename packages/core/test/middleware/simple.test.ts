import { TestStartup } from "../test-startup";

test("simpple middleware", async () => {
  const startup = new TestStartup()
    .use(async (ctx, next) => {
      ctx.set("mdw1", "mdw1");
      await next();
    })
    .use(async (ctx, next) => {
      ctx.set("mdw2", "mdw2");
      await next();
      ctx.set("mdw4", "mdw4->2");
    })
    .use(async (ctx, next) => {
      ctx.set("mdw3", "mdw3");
      await next();
    })
    .use(async (ctx, next) => {
      ctx.set("mdw4", "mdw4");
      await next();
    })
    .use(async (ctx, next) => {
      ctx.set("mdw5", "mdw5");
      await next();
    })
    .use(async (ctx, next) => {
      ctx.set("ctx", "OK");
      await next();
    });

  const { ctx } = await startup.run();
  expect(ctx.get("ctx")).toBe("OK");
  expect(ctx.get("mdw1")).toBe("mdw1");
  expect(ctx.get("mdw2")).toBe("mdw2");
  expect(ctx.get("mdw3")).toBe("mdw3");
  expect(ctx.get("mdw4")).toBe("mdw4->2");
  expect(ctx.get("mdw5")).toBe("mdw5");
  expect(ctx.get("mdw6")).toBeUndefined();
});
