import "../src";
import { TestHttpStartup } from "@halsp/testing/dist/http";

test("arr header type", async function () {
  const res = await new TestHttpStartup()
    .koa(async (ctx, next) => {
      ctx.body = "halsp";
      ctx.status = 200;
      ctx.set("Content-Type", ["text/plain", "charset=utf-8"]);
      await next();
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("halsp");
  expect(res.getHeader("content-type")).toEqual([
    "text/plain",
    "charset=utf-8",
  ]);
});

test("without type", async function () {
  const res = await new TestHttpStartup()
    .koa(async (ctx, next) => {
      ctx.body = "halsp";
      ctx.status = 200;
      ctx.set("Content-Type", "");
      await next();
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("halsp");
  expect(res.getHeader("content-type")).toBe("text/plain; charset=utf-8");
});
