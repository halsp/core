import { TestStartup } from "../../src";

test("invoke multiple", async function () {
  const startup = new TestStartup()
    .use(async (ctx, next) => {
      if (!ctx.res.body) {
        ctx.res.body = 0;
      }
      (ctx.res.body as number)++;
      await next();
    })
    .use(async (ctx) => {
      (ctx.res.body as number)++;
    });
  let res = await startup.run();
  expect(res.body).toBe(2);
  res = await startup.run();
  expect(res.body).toBe(2);
  res = await startup.run();
  expect(res.body).toBe(2);
});

test("throw error", async function () {
  const startup = new TestStartup();
  startup.use(async (ctx) => {
    ctx.res.setHeader("h1", "1");
    throw new Error("msg");
  });
  try {
    await startup.run();
  } catch (err) {
    expect(err.message).toBe("msg");
    return;
  }
  expect(true).toBe(false);
});
