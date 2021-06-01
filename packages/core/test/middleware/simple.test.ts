import Request from "../../src/Request";
import { SimpleStartup } from "../../src";

test("simpple middleware", async function () {
  const startup = new SimpleStartup(new Request())
    .use(async (ctx, next) => {
      ctx.res.headers.mdw1 = "mdw1";
      await next();
    })
    .use(async (ctx, next) => {
      ctx.res.headers.mdw2 = "mdw2";
      await next();
      ctx.res.headers.mdw4 = "mdw4->2";
    })
    .use(async (ctx, next) => {
      ctx.res.headers.mdw3 = "mdw3";
      await next();
    })
    .use(async (ctx, next) => {
      ctx.res.headers.mdw4 = "mdw4";
      await next();
    })
    .use(async (ctx, next) => {
      ctx.res.headers.mdw5 = "mdw5";
      await next();
    })
    .use(async (ctx) => {
      ctx.res.status = 200;
    });

  const result = await startup.run();
  expect(result.status).toBe(200);
  expect(result.headers.mdw1).toBe("mdw1");
  expect(result.headers.mdw2).toBe("mdw2");
  expect(result.headers.mdw3).toBe("mdw3");
  expect(result.headers.mdw4).toBe("mdw4->2");
  expect(result.headers.mdw5).toBe("mdw5");
  expect(result.headers.mdw6).toBeUndefined();
});
