import { Request } from "@ipare/http";
import { runMva } from "./global";
import "../src";
import { TestHttpStartup } from "@ipare/testing";

test("not allowed method", async function () {
  await runMva(async () => {
    const res = await new TestHttpStartup()
      .setRequest(new Request().setMethod("post"))
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
      const res = await new TestHttpStartup()
        .setRequest(new Request().setMethod("post"))
        .useMva({
          renderMethods: "any",
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
