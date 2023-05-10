import "@halsp/testing";
import { createTestContext } from "./utils";
import "../src";
import { Startup } from "@halsp/core";

test("prefix", async function () {
  process.env.HALSP_ENV = "http";
  const { ctx } = await new Startup()
    .setContext(
      await createTestContext(
        {
          secret: "secret",
        },
        undefined,
        "custom "
      )
    )
    .useJwt({
      secret: "secret",
      prefix: "custom",
    })
    .useJwtVerify()
    .use((ctx) => ctx.set("token", ctx.jwtToken))
    .test();
  expect(!!ctx.get("token")).toBeTruthy();
});
