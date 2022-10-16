import { ComposeMiddleware } from "../../src";
import { TestStartup } from "../test-startup";

test("compose middleware", async () => {
  let index = 0;
  function getIndex() {
    index++;
    return index;
  }

  const { ctx } = await new TestStartup()
    .use(async (ctx, next) => {
      ctx.bag("h11", getIndex());
      await next();
      ctx.bag("h12", getIndex());
    })
    .add(() =>
      new ComposeMiddleware()
        .use(async (ctx, next) => {
          ctx.bag("h21", getIndex());
          await next();
          ctx.bag("h22", getIndex());
        })
        .add(() =>
          new ComposeMiddleware()
            .use(async (ctx, next) => {
              ctx.bag("h31", getIndex());
              await next();
              ctx.bag("h32", getIndex());
            })
            .add(() =>
              new ComposeMiddleware()
                .use(async (ctx, next) => {
                  ctx.bag("h41", getIndex());
                  await next();
                  ctx.bag("h42", getIndex());
                })
                .use(async (ctx, next) => {
                  ctx.bag("h51", getIndex());
                  await next();
                  ctx.bag("h52", getIndex());
                })
            )
            .use(async (ctx, next) => {
              ctx.bag("h61", getIndex());
              await next();
              ctx.bag("h62", getIndex());
            })
        )
        .use(async (ctx, next) => {
          ctx.bag("h71", getIndex());
          await next();
          ctx.bag("h72", getIndex());
        })
    )
    .use(async (ctx, next) => {
      ctx.bag("h81", getIndex());
      await next();
      ctx.bag("h82", getIndex());
    })
    .run();

  expect(ctx.bag("h11")).toBe(1);
  expect(ctx.bag("h21")).toBe(2);
  expect(ctx.bag("h31")).toBe(3);
  expect(ctx.bag("h41")).toBe(4);
  expect(ctx.bag("h51")).toBe(5);
  expect(ctx.bag("h61")).toBe(6);
  expect(ctx.bag("h71")).toBe(7);
  expect(ctx.bag("h81")).toBe(8);
  expect(ctx.bag("h82")).toBe(9);
  expect(ctx.bag("h72")).toBe(10);
  expect(ctx.bag("h62")).toBe(11);
  expect(ctx.bag("h52")).toBe(12);
  expect(ctx.bag("h42")).toBe(13);
  expect(ctx.bag("h32")).toBe(14);
  expect(ctx.bag("h22")).toBe(15);
  expect(ctx.bag("h12")).toBe(16);
});

test("compose enable = true", async () => {
  const { ctx } = await new TestStartup()
    .add(() =>
      new ComposeMiddleware(() => true).use(async (ctx) => {
        ctx.bag("h", 1);
      })
    )
    .run();
  expect(ctx.bag("h")).toBe(1);
});

test("compose enable = false", async () => {
  const { ctx } = await new TestStartup()
    .add(() =>
      new ComposeMiddleware(() => false).use(async (ctx) => {
        ctx.bag("h", 1);
      })
    )
    .run();
  expect(ctx.bag("h")).toBeUndefined();
});
