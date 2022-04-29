import { TestStartup } from "@sfajs/core";
import "../src";
import { createSfaReqeust } from "./utils";

function runTest(auth: boolean) {
  test(`auth ${auth}`, async function () {
    const res = await new TestStartup(
      await createSfaReqeust({
        secret: "secret",
      })
    )
      .useJwt({
        secret: "secret",
      })
      .useJwtExtraAuth(() => auth)
      .use((ctx) => ctx.ok())
      .run();
    expect(res.status).toBe(auth ? 200 : 401);
  });
}

runTest(true);
runTest(false);

test(`auth failed with custom status`, async function () {
  const res = await new TestStartup(
    await createSfaReqeust({
      secret: "secret",
    })
  )
    .useJwt({
      secret: "secret",
    })
    .useJwtExtraAuth(async (ctx) => {
      ctx.forbiddenMsg();
      return false;
    })
    .use((ctx) => ctx.ok())
    .run();
  expect(res.status).toBe(403);
});
