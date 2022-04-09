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
      .useMva({
        onParserAdded: (startup) => startup.add(AuthMiddleware),
      })
      .run();

    expect(res.status).toBe(200);
    expect(res.getHeader("content-type")).toBe("text/html");
    expect(res.body).toBe("<p>email: test1@hal.wang</p>");
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
      .useMva({
        onParserAdded: (startup) => startup.add(AuthMiddleware),
      })
      .run();

    expect(res.body).toEqual({
      message: "error email or password",
      status: 403,
    });
    expect(res.status).toBe(403);
  });
});
