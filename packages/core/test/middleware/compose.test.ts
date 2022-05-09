import { ComposeMiddleware } from "../../src";
import { TestStartup } from "../test-startup";

test("simpple middleware", async () => {
  let index = 0;
  function getIndex() {
    index++;
    return index;
  }

  const res = await new TestStartup()
    .use(async (ctx, next) => {
      ctx.res.setHeader("h11", getIndex());
      await next();
      ctx.res.setHeader("h12", getIndex());
    })
    .add(() =>
      new ComposeMiddleware()
        .use(async (ctx, next) => {
          ctx.res.setHeader("h21", getIndex());
          await next();
          ctx.res.setHeader("h22", getIndex());
        })
        .add(() =>
          new ComposeMiddleware()
            .use(async (ctx, next) => {
              ctx.res.setHeader("h31", getIndex());
              await next();
              ctx.res.setHeader("h32", getIndex());
            })
            .add(() =>
              new ComposeMiddleware()
                .use(async (ctx, next) => {
                  ctx.res.setHeader("h41", getIndex());
                  await next();
                  ctx.res.setHeader("h42", getIndex());
                })
                .use(async (ctx, next) => {
                  ctx.res.setHeader("h51", getIndex());
                  await next();
                  ctx.res.setHeader("h52", getIndex());
                })
            )
            .use(async (ctx, next) => {
              ctx.res.setHeader("h61", getIndex());
              await next();
              ctx.res.setHeader("h62", getIndex());
            })
        )
        .use(async (ctx, next) => {
          ctx.res.setHeader("h71", getIndex());
          await next();
          ctx.res.setHeader("h72", getIndex());
        })
    )
    .use(async (ctx, next) => {
      ctx.res.setHeader("h81", getIndex());
      await next();
      ctx.res.setHeader("h82", getIndex());
    })
    .run();

  expect(res.getHeader("h11")).toBe("1");
  expect(res.getHeader("h21")).toBe("2");
  expect(res.getHeader("h31")).toBe("3");
  expect(res.getHeader("h41")).toBe("4");
  expect(res.getHeader("h51")).toBe("5");
  expect(res.getHeader("h61")).toBe("6");
  expect(res.getHeader("h71")).toBe("7");
  expect(res.getHeader("h81")).toBe("8");
  expect(res.getHeader("h82")).toBe("9");
  expect(res.getHeader("h72")).toBe("10");
  expect(res.getHeader("h62")).toBe("11");
  expect(res.getHeader("h52")).toBe("12");
  expect(res.getHeader("h42")).toBe("13");
  expect(res.getHeader("h32")).toBe("14");
  expect(res.getHeader("h22")).toBe("15");
  expect(res.getHeader("h12")).toBe("16");
});
