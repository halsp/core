import { TestStartup } from "@sfajs/core";
import { JwtToken, parseJwtDeco } from "../src";
import { createSfaReqeust } from "./utils";

class TestClass {
  @JwtToken
  readonly jwt!: string;
}

test(`auth failed with custom status`, async () => {
  let jwt: any;
  const res = await new TestStartup(
    await createSfaReqeust({
      secret: "secret",
    })
  )
    .useJwt({
      secret: "secret",
    })
    .use((ctx) => {
      jwt = ctx.jwtToken;
      const obj1 = parseJwtDeco(ctx, new TestClass());
      const obj2 = parseJwtDeco(ctx, TestClass);
      ctx.ok({
        jwt1: obj1.jwt,
        jwt2: obj2.jwt,
      });
    })
    .run();
  expect(res.body["jwt1"]).toBe(jwt);
  expect(res.body["jwt2"]).toBe(jwt);
  expect(res.status).toBe(200);
});
