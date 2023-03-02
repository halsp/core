import { TestStartup } from "@halsp/testing";
import { createTestContext } from "./utils";
import "../src";

test("prefix", async function () {
  process.env.HALSP_ENV = "http";
  const { ctx } = await new TestStartup()
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
    .run();
  expect(!!ctx.get("token")).toBeTruthy();
});
