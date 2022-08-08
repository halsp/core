import { Request } from "@ipare/core";
import { runMva } from "./global";
import "../src";
import { TestStartup } from "@ipare/testing";

test("not allowed method", async function () {
  await runMva(async () => {
    const res = await new TestStartup({
      req: new Request().setMethod("post"),
    })
      .useMva()
      .run();

    expect(res.getHeader("content-type")).toBe(
      "application/json; charset=utf-8"
    );
    expect(res.status).toBe(200);
  });
});

function testRanderEnable(enable: boolean) {
  test(`randerEnable ${enable}`, async function () {
    await runMva(async () => {
      const res = await new TestStartup({
        req: new Request().setMethod("post"),
      })
        .useMva({
          methods: "any",
          randerEnable: () => enable,
        })
        .run();

      expect(res.getHeader("content-type")).toBe(
        enable ? "text/html" : "application/json; charset=utf-8"
      );
      expect(res.status).toBe(200);
    });
  });
}
testRanderEnable(true);
testRanderEnable(false);
