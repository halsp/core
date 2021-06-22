import "../src";
import { TestStartup, Request } from "sfa";

test("default html", async function () {
  const res = await new TestStartup(new Request().setMethod("GET"))
    .useSwagger()
    .run();

  expect(res.getHeader("content-type")).toBe("text/html");
  expect(res.status).toBe(200);
});

test("default json", async function () {
  const res = await new TestStartup(
    new Request().setParam("type", "json").setMethod("GET")
  )
    .use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        ctx.badRequest(err.message);
      }
    })
    .useSwagger()
    .run();
  expect(res.status).toBe(200);
});

test("json", async function () {
  const res = await new TestStartup(
    new Request().setParam("type", "json").setMethod("GET")
  )
    .useSwagger({
      options: {
        definition: {
          swagger: "2.0",
          info: {
            title: "Test",
            version: "1.0.0",
          },
        },
        apis: ["test/docs/*.ts"],
      },
    })
    .run();

  expect(res.getHeader("content-type")).toBe("application/json");
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
      customHtml: "html",
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("html");
});
