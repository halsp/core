import { StatusCodes } from "http-status-codes";
import { Middleware, ResponseError, SimpleStartup } from "../../src";

test("invoke without md", async function () {
  const startup = new SimpleStartup();
  await startup.run();
  expect(startup.ctx.mds.length).toBe(0);
});

test("set md", async function () {
  class Md extends Middleware {
    async invoke(): Promise<void> {
      startup.ctx.res.body = "sfa";
    }
  }

  const startup = new SimpleStartup().use(async (ctx) => {
    ctx.res.body = "sfa md1";
  });
  startup.ctx.mds[0].md = new Md();
  await startup.run();
  expect(startup.ctx.res.body).toBe("sfa");
});

test("invoke multiple", async function () {
  const startup = new SimpleStartup()
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
  await startup.run();
  await startup.run();
  await startup.run();
  expect(startup.ctx.res.body).toBe(3 * 2);
});

test("handle error", async function () {
  const startup = new SimpleStartup();
  startup.use(async (ctx) => {
    ctx.res.headers.h1 = "1";
    throw new ResponseError()
      .setBody({
        message: "handle error",
      })
      .setHeader("h2", "2")
      .setStatus(StatusCodes.BAD_REQUEST);
  });
  await startup.run();

  expect(startup.ctx.res.headers.h1).toBe("1");
  expect(startup.ctx.res.headers.h2).toBe("2");
  expect(startup.ctx.res.status).toBe(400);
  expect(startup.ctx.res.body).toEqual({
    message: "handle error",
  });
});

test("handle error null value", async function () {
  try {
    const startup = new SimpleStartup();
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
  const startup = new SimpleStartup();
  startup.use(async (ctx) => {
    ctx.res.headers.h1 = "1";
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
