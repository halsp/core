import "../src";
import { TestStartup, SfaRequest } from "@sfajs/core";

test("default html", async function () {
  const res = await new TestStartup(new SfaRequest().setMethod("GET"))
    .useSwagger()
    .run();

  expect(res.getHeader("content-type")).toBe("text/html");
  expect(res.status).toBe(200);
});

test("not exist", async function () {
  const res = await new TestStartup(
    new SfaRequest().setPath("not-exist").setMethod("GET")
  )
    .useSwagger()
    .run();

  expect(res.status).toBe(404);
});

test("custom html", async function () {
  const res = await new TestStartup(new SfaRequest().setMethod("GET"))
    .useSwagger({
      customHtml: () => "html",
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("html");
});

test("custom html with promise", async function () {
  const res = await new TestStartup(new SfaRequest().setMethod("GET"))
    .useSwagger({
      customHtml: async () => "html",
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("html");
});
