import { TestStartup } from "@ipare/core";
import { createIpareReqeust } from "./utils";
import "../src";

test("prefix", async function () {
  const result = await new TestStartup(
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
