import { TestStartup } from "@sfajs/core";
import { createSfaReqeust } from "./utils";
import "../src";

function testErrorSecret(isError: boolean) {
  test(`error secret ${isError}`, async function () {
    const result = await new TestStartup(
      await createSfaReqeust({
        secret: isError ? "secret1" : "secret",
      })
    )
      .useJwt({
        secret: "secret",
      })
      .use((ctx) => {
        ctx.ok();
      })
      .run();
    expect(result.status).toBe(isError ? 401 : 200);
  });
}

testErrorSecret(true);
testErrorSecret(false);
