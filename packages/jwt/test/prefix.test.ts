import { TestStartup } from "@ipare/testing";
import { createIpareReqeust } from "./utils";
import "../src";

test("prefix", async function () {
  const result = await new TestStartup()
    .setRequest(
      await createIpareReqeust(
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
    .use((ctx) => ctx.ok(ctx.jwtToken))
    .run();
  expect(result.status).toBe(200);
});
