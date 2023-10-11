import { Request, Startup } from "@halsp/core";
import "@halsp/testing";
import { runMva } from "./global";
import "../src";
import { HttpMethods } from "@halsp/http";

test("not allowed method", async function () {
  await runMva(async () => {
    const res = await new Startup()
      .setContext(new Request().setMethod("post"))
      .useMva()
      .test();

    expect(res.getHeader("content-type")).toBe(
      "application/json; charset=utf-8",
    );
    expect(res.status).toBe(200);
  });
});

function testRanderEnable(enable: boolean) {
  test(`randerEnable ${enable}`, async function () {
    await runMva(async () => {
      const res = await new Startup()
        .setContext(new Request().setMethod("post"))
        .useMva({
          renderMethods: HttpMethods.any,
          randerEnable: () => enable,
        })
        .test();

      expect(res.getHeader("content-type")).toBe(
        enable ? "text/html" : "application/json; charset=utf-8",
      );
      expect(res.status).toBe(200);
    });
  });
}
testRanderEnable(true);
testRanderEnable(false);
