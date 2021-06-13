import { StatusCodes } from "http-status-codes";
import { ResponseError, TestStartup } from "../../src";

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

test("handle error", async function () {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.res.setHeader("h1", "1");
      throw new ResponseError()
        .setBody({
          message: "handle error",
        })
        .setHeader("h2", "2")
        .setStatus(StatusCodes.BAD_REQUEST);
    })
    .run();

  expect(res.getHeader("h1")).toBe("1");
  expect(res.getHeader("h2")).toBe("2");
  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    message: "handle error",
  });
});

test("handle error null value", async function () {
  try {
    const startup = new TestStartup();
    startup.use(async (ctx) => {
      ctx.res.setHeader("h1", "sfa");
      throw (
        new ResponseError("error test")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .setStatus(undefined as any)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .setBody(undefined as any)
      );
    });
    await startup.run();
  } catch (err) {
    expect(err.message).toBe("error test");
    expect(err.body).toBeUndefined();
    expect(err.status).toBeUndefined();
  }
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
