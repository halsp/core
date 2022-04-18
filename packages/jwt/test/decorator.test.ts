import { Middleware, TestStartup } from "@sfajs/core";
import * as jwt from "jsonwebtoken";
import { JwtJson, JwtPayload, JwtToken } from "../src";
import { createSfaReqeust } from "./utils";

class TestMiddleware extends Middleware {
  @JwtJson
  private readonly jwt!: jwt.Jwt;
  @JwtPayload
  private readonly payload!: any;
  @JwtToken
  private readonly str1!: any;
  @JwtToken
  private readonly str2!: any;

  async invoke(): Promise<void> {
    this.ok({
      jwt: this.jwt,
      payload: this.payload,
      str1: this.str1,
      str2: this.str2,
    });
  }
}

test("decorator", async function () {
  let jwt = "";
  const result = await new TestStartup(
    await createSfaReqeust({
      secret: "secret",
    })
  )
    .useJwt({
      secret: "secret",
    })
    .use(async (ctx, next) => {
      jwt = ctx.jwtToken;
      await next();
    })
    .add(TestMiddleware)
    .run();
  expect(Object.keys(result.body["jwt"])).toEqual([
    "header",
    "payload",
    "signature",
  ]);
  expect(Object.keys(result.body["payload"])).toEqual(["iat"]);
  expect(result.body["payload"]).toEqual(result.body["jwt"]["payload"]);
  expect(result.body["str1"]).toBe(jwt);
  expect(result.body["str2"]).toBe(jwt);
  expect(result.status).toBe(200);
});

test("getToken option", async function () {
  const result = await new TestStartup(
    await createSfaReqeust({
      secret: "secret",
    })
  )
    .useJwt({
      secret: "secret",
      getToken: () => "test",
    })
    .add(TestMiddleware)
    .run();
  expect(result.status).toBe(401);
});
