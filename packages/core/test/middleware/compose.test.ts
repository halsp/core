import { ComposeMiddleware, TestStartup } from "../../src";

test("simpple middleware", async function () {
  let index = 0;
  function getIndex() {
    index++;
    return index;
  }

  const startup = new TestStartup()
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
    });

  const result = await startup.run();
  expect(result.getHeader("h11")).toBe("1");
  expect(result.getHeader("h21")).toBe("2");
  expect(result.getHeader("h31")).toBe("3");
  expect(result.getHeader("h41")).toBe("4");
  expect(result.getHeader("h51")).toBe("5");
  expect(result.getHeader("h61")).toBe("6");
  expect(result.getHeader("h71")).toBe("7");
  expect(result.getHeader("h81")).toBe("8");
  expect(result.getHeader("h82")).toBe("9");
  expect(result.getHeader("h72")).toBe("10");
  expect(result.getHeader("h62")).toBe("11");
  expect(result.getHeader("h52")).toBe("12");
  expect(result.getHeader("h42")).toBe("13");
  expect(result.getHeader("h32")).toBe("14");
  expect(result.getHeader("h22")).toBe("15");
  expect(result.getHeader("h12")).toBe("16");
});
