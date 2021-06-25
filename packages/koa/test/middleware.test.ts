import "../src";
import { TestStartup, Request } from "sfa";
import * as Koa from "koa";
import * as cors from "koa-cors";

test("cors", async function () {
  const res = await new TestStartup(new Request().setMethod("POST"))
    .useKoa(
      new Koa().use(
        cors({
          methods: "GET,POST",
          origin: "http://localhost",
        })
      )
    )
    .use(async (ctx) => {
      ctx.ok("sfa");
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("sfa");
  expect(res.getHeader("Access-Control-Allow-Methods")).toBe("GET,POST");
  expect(res.getHeader("Access-Control-Allow-Origin")).toBe("http://localhost");
});
