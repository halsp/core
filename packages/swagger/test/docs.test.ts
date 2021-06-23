import "../src";
import { TestStartup, Request } from "sfa";

test("default html", async function () {
  const res = await new TestStartup(new Request().setMethod("GET"))
    .useSwagger()
    .run();

  expect(res.getHeader("content-type")).toBe("text/html");
  expect(res.status).toBe(200);
});

test("not exist", async function () {
  const res = await new TestStartup(
    new Request().setPath("not-exist").setMethod("GET")
  )
    .useSwagger()
    .run();

  expect(res.status).toBe(404);
});

test("custom html", async function () {
  const res = await new TestStartup(new Request().setMethod("GET"))
    .useSwagger({
      customHtml: () => "html",
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("html");
});

test("custom html with promise", async function () {
  {
    const res = await new TestStartup(new Request().setMethod("GET"))
      .useSwagger({
        customHtml: () =>
          new Promise((resolve) => {
            resolve("html");
          }),
      })
      .run();

    expect(res.status).toBe(200);
    expect(res.body).toBe("html");
  }

  {
    const res = await new TestStartup(new Request().setMethod("GET"))
      .useSwagger({
        customHtml: async () => "html",
      })
      .run();

    expect(res.status).toBe(200);
    expect(res.body).toBe("html");
  }
});

test("error options", async function () {
  const res = await new TestStartup(new Request().setMethod("GET"))
    .use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        ctx.badRequest();
      }
    })
    .useSwagger({
      customHtml: async () => "html",
      options: {},
    })
    .run();

  expect(res.status).toBe(400);
  expect(res.body).toBeUndefined();
});
