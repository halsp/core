import { ComposeMiddleware, Middleware } from "../src";
import { TestStartup } from "./test-startup";

describe("middleware", () => {
  it("it should invoke middlewares", async () => {
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

  it("should invoke compose middleware", async () => {
    let index = 0;
    function getIndex() {
      index++;
      return index;
    }

    const { ctx } = await new TestStartup()
      .use(async (ctx, next) => {
        ctx.set("h11", getIndex());
        await next();
        ctx.set("h12", getIndex());
      })
      .add(() =>
        new ComposeMiddleware()
          .use(async (ctx, next) => {
            ctx.set("h21", getIndex());
            await next();
            ctx.set("h22", getIndex());
          })
          .add(() =>
            new ComposeMiddleware()
              .use(async (ctx, next) => {
                ctx.set("h31", getIndex());
                await next();
                ctx.set("h32", getIndex());
              })
              .add(() =>
                new ComposeMiddleware()
                  .use(async (ctx, next) => {
                    ctx.set("h41", getIndex());
                    await next();
                    ctx.set("h42", getIndex());
                  })
                  .use(async (ctx, next) => {
                    ctx.set("h51", getIndex());
                    await next();
                    ctx.set("h52", getIndex());
                  })
              )
              .use(async (ctx, next) => {
                ctx.set("h61", getIndex());
                await next();
                ctx.set("h62", getIndex());
              })
          )
          .use(async (ctx, next) => {
            ctx.set("h71", getIndex());
            await next();
            ctx.set("h72", getIndex());
          })
      )
      .use(async (ctx, next) => {
        ctx.set("h81", getIndex());
        await next();
        ctx.set("h82", getIndex());
      })
      .run();

    expect(ctx.get("h11")).toBe(1);
    expect(ctx.get("h21")).toBe(2);
    expect(ctx.get("h31")).toBe(3);
    expect(ctx.get("h41")).toBe(4);
    expect(ctx.get("h51")).toBe(5);
    expect(ctx.get("h61")).toBe(6);
    expect(ctx.get("h71")).toBe(7);
    expect(ctx.get("h81")).toBe(8);
    expect(ctx.get("h82")).toBe(9);
    expect(ctx.get("h72")).toBe(10);
    expect(ctx.get("h62")).toBe(11);
    expect(ctx.get("h52")).toBe(12);
    expect(ctx.get("h42")).toBe(13);
    expect(ctx.get("h32")).toBe(14);
    expect(ctx.get("h22")).toBe(15);
    expect(ctx.get("h12")).toBe(16);
  });
});

describe("context", () => {
  class TestMiddleware extends Middleware {
    invoke() {
      return;
    }
  }

  it("should init ctx", async () => {
    const md = new TestMiddleware();
    const startup = new TestStartup();
    await startup.add(() => md).run();
    expect(md.ctx).not.toBeUndefined();
    expect(md.ctx.startup).toBe(startup);
  });

  it("should init req", async () => {
    const md = new TestMiddleware();
    const startup = new TestStartup();
    await startup.add(() => md).run();
    expect(md.req).toBe(md.ctx.req);
    expect(md.request).toBe(md.ctx.req);
  });

  it("should init res", async () => {
    const md = new TestMiddleware();
    const startup = new TestStartup();
    await startup.add(() => md).run();
    expect(md.res).toBe(md.ctx.res);
    expect(md.response).toBe(md.ctx.res);
  });
});
