import { SfaRequest, TestStartup } from "@sfajs/core";
import "../src";
import { AuthMiddleware } from "./mva/auth.middleware";
import { runMva } from "./global";

test("auth access", async function () {
  await runMva(async () => {
    const res = await new TestStartup(
      new SfaRequest()
        .setPath("user/test1@hal.wang")
        .setMethod("GET")
        .setHeader("password", "test1password")
    )
      .use(async (ctx, next) => {
        await next();
      })
      .add(AuthMiddleware)
      .useMva()
      .run();

    expect(res.status).toBe(200);
    expect(res.body).toBe("<p>email: test1@hal.wang</p>");
    expect(res.getHeader("content-type")).toBe("text/html");
  });
});

test("auth failed", async function () {
  await runMva(async () => {
    const res = await new TestStartup(
      new SfaRequest()
        .setPath("user/test1@hal.wang")
        .setMethod("GET")
        .setHeader("password", "test2password")
    )
      .add(AuthMiddleware)
      .useMva()
      .run();

    expect(res.body).toEqual({
      message: "error email or password",
      status: 403,
    });
    expect(res.status).toBe(403);
  });
});
