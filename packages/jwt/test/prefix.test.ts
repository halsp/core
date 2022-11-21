import { TestStartup } from "@ipare/testing";
import { createTestContext } from "./utils";
import "../src";

test("prefix", async function () {
  process.env.IPARE_ENV = "http";
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
    .use((ctx) => ctx.bag("token", ctx.jwtToken))
    .run();
  expect(!!ctx.bag("token")).toBeTruthy();
});
