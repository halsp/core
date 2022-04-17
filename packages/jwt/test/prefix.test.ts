import { TestStartup } from "@sfajs/core";
import { createSfaReqeust } from "./utils";
import "../src";

test("prefix", async function () {
  const result = await new TestStartup(
    await createSfaReqeust(
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
    .use((ctx) => ctx.ok(ctx.jwtToken))
    .run();
  expect(result.status).toBe(200);
});
