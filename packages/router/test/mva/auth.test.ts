import { SfaRequest, TestStartup } from "sfa";
import "../../src";
import Auth from "./Auth";
import { runMva } from "../global";

test("auth access", async function () {
  await runMva(async () => {
    const res = await new TestStartup(
      new SfaRequest()
        .setPath("user/test1@hal.wang")
        .setMethod("GET")
        .setHeader("password", "test1password")
    )
      .useMva({
        routerConfig: {
          onParserAdded: (startup) => {
            startup.add(() => new Auth());
          },
        },
      })
      .run();

    console.log("body", res.body);
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
        routerConfig: {
          onParserAdded: (startup) => {
            startup.add(() => new Auth());
          },
        },
      })
      .run();

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: "error email or password" });
  });
});
