import { Request, Startup } from "@halsp/core";
import "@halsp/testing";
import "../src";
import { runMva } from "./global";

test("default", async function () {
  await runMva(async () => {
    const res = await new Startup()
      .setContext(new Request().setMethod("GET"))
      .useMva()
      .test();

    expect(res.getHeader("content-type")).toBe("text/html");
    expect(res.status).toBe(200);
    expect(res.body).toBe("<p>@halsp/mva</p>");
  });
});

test("use again", async function () {
  await runMva(async () => {
    const res = await new Startup()
      .setContext(new Request().setMethod("GET"))
      .useMva()
      .useMva()
      .test();

    expect(res.getHeader("content-type")).toBe("text/html");
    expect(res.status).toBe(200);
    expect(res.body).toBe("<p>@halsp/mva</p>");
  });
});
