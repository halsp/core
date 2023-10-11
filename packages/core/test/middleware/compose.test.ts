import { ComposeMiddleware, HookType, Startup } from "../../src";
import { LambdaMiddleware } from "../../src/middlewares";
import "../test-startup";

describe("compose middleware", () => {
  test("compose middleware", async () => {
    let index = 0;
    function getIndex() {
      index++;
      return index;
    }

    const { ctx } = await new Startup()
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
                  }),
              )
              .use(async (ctx, next) => {
                ctx.set("h61", getIndex());
                await next();
                ctx.set("h62", getIndex());
              }),
          )
          .use(async (ctx, next) => {
            ctx.set("h71", getIndex());
            await next();
            ctx.set("h72", getIndex());
          }),
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

  test("compose enable = true", async () => {
    const { ctx } = await new Startup()
      .add(() =>
        new ComposeMiddleware(() => true).use(async (ctx) => {
          ctx.set("h", 1);
        }),
      )
      .run();
    expect(ctx.get("h")).toBe(1);
  });

  test("compose enable = false", async () => {
    const { ctx } = await new Startup()
      .add(() =>
        new ComposeMiddleware(() => false).use(async (ctx) => {
          ctx.set("h", 1);
        }),
      )
      .run();
    expect(ctx.get("h")).toBeUndefined();
  });

  it("should", async () => {
    await new Startup()
      .hook(HookType.Error, (ctx, md) => {
        expect(md instanceof LambdaMiddleware).toBeTruthy();
        return false;
      })
      .add(() =>
        new ComposeMiddleware().use(async (ctx, next) => {
          throw new Error("err");
          await next();
        }),
      )
      .run();
  });
});
