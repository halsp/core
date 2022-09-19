import { TestStartup } from "./test-startup";

describe("error", () => {
  it("should push error stack when throw error", async () => {
    const ctx = await new TestStartup()
      .use(async () => {
        throw new Error();
      })
      .run();
    expect(ctx.errorStack.length).toBe(1);
  });

  it("should breakthrough when set error.breakthrough = true", async () => {
    const ctx = await new TestStartup()
      .use(async (ctx, next) => {
        await next();
        ctx.bag("test", true);
      })
      .use(async () => {
        const err = new Error();
        err["breakthrough"] = true;
        throw err;
      })
      .run();

    expect(ctx.errorStack.length).toBe(1);
    expect(ctx.bag("test")).toBeUndefined();
  });

  it("should not breakthrough when set error.breakthrough = false", async () => {
    const ctx = await new TestStartup()
      .use(async (ctx, next) => {
        await next();
        ctx.bag("test", true);
      })
      .use(async () => {
        const err = new Error();
        err["breakthrough"] = false;
        throw err;
      })
      .run();

    expect(ctx.errorStack.length).toBe(1);
    expect(ctx.bag("test")).toBeTruthy();
  });
});
