import { TestStartup } from "@sfajs/core";
import { parseInject } from "@sfajs/inject";
import "../src";
import { JwtService } from "../src";
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

test(`null token`, async function () {
  const res = await new TestStartup()
    .useJwt({
      secret: "secret",
    })
    .use(async (ctx) => {
      const jwtService = await parseInject(ctx, JwtService);
      try {
        await jwtService.verify(null as any);
        ctx.notFound();
      } catch (ex) {
        ctx.ok();
      }
    })
    .run();
  expect(res.status).toBe(200);
});
