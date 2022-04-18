import { Middleware, TestStartup } from "@sfajs/core";
import * as jwt from "jsonwebtoken";
import { JwtObject, JwtParse, JwtPayload, JwtToken } from "../src";
import { createSfaReqeust } from "./utils";

class TestService extends Object {
  @JwtToken
  readonly token!: string;
  @JwtObject
  readonly jwt!: jwt.Jwt;
}

class TestMiddleware extends Middleware {
  @JwtObject
  private readonly jwt!: jwt.Jwt;
  @JwtPayload
  private readonly payload!: any;
  @JwtToken
  private readonly str1!: any;
  @JwtToken
  private readonly str2!: any;
  @JwtParse
  private readonly service1!: TestService;
  @JwtParse
  private readonly service2!: TestService;

  async invoke(): Promise<void> {
    this.ok({
      jwt: this.jwt,
      payload: this.payload,
      str1: this.str1,
      str2: this.str2,
      service: {
        token1: this.service1.token,
        token2: this.service2.token,
        jwt1: this.service1.jwt,
        jwt2: this.service2.jwt,
      },
    });
  }
}

test("decorator", async function () {
  let jwt = "";
  const res = await new TestStartup(
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
  expect(Object.keys(res.body["jwt"])).toEqual([
    "header",
    "payload",
    "signature",
  ]);
  expect(Object.keys(res.body["payload"])).toEqual(["iat"]);
  expect(res.body["payload"]).toEqual(res.body["jwt"]["payload"]);
  expect(res.body["str1"]).toBe(jwt);
  expect(res.body["str2"]).toBe(jwt);
  expect(res.body["service"]).toEqual({
    token1: jwt,
    token2: jwt,
    jwt1: res.body["jwt"],
    jwt2: res.body["jwt"],
  });
  expect(res.status).toBe(200);
});

test("getToken option", async function () {
  const res = await new TestStartup(
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
  expect(res.status).toBe(401);
});
