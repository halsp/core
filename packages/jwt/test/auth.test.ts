import { TestStartup } from "@sfajs/core";
import "../src";
import { createSfaReqeust } from "./utils";

function runTest(auth: boolean) {
  function run(customError: boolean) {
    test(`auth ${auth}`, async function () {
      const res = await new TestStartup(
        await createSfaReqeust({
          secret: "secret",
        })
      )
        .useJwt({
          secret: "secret",
        })
        .useJwtExtraAuth(
          () => auth,
          customError
            ? (ctx) => {
                ctx.res.setHeader("err", "1");
              }
            : undefined
        )
        .use((ctx) => ctx.ok())
        .run();
      expect(res.status).toBe(auth ? 200 : customError ? 404 : 401);
      expect(res.getHeader("err")).toBe(customError && !auth ? "1" : undefined);
    });
  }
  run(true);
  run(false);
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
