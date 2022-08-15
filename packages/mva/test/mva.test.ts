import { Request } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../src";
import { runMva } from "./global";

test("default", async function () {
  await runMva(async () => {
    const res = await new TestStartup()
      .setRequest(new Request().setMethod("GET"))
      .useMva()
      .run();

    expect(res.getHeader("content-type")).toBe("text/html");
    expect(res.status).toBe(200);
    expect(res.body).toBe("<p>@ipare/mva</p>");
  });
});

test("use again", async function () {
  await runMva(async () => {
    const res = await new TestStartup()
      .setRequest(new Request().setMethod("GET"))
      .useMva()
      .useMva()
      .run();

    expect(res.getHeader("content-type")).toBe("text/html");
    expect(res.status).toBe(200);
    expect(res.body).toBe("<p>@ipare/mva</p>");
  });
});
