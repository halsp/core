import { Middleware } from "@ipare/core";
import * as jwt from "jsonwebtoken";
import { JwtObject, JwtPayload, JwtToken } from "../src";
import "../src";
import { createIpareReqeust } from "./utils";
import { TestStartup } from "@ipare/testing";

class TestMiddleware extends Middleware {
  @JwtObject
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
  const res = await new TestStartup({
    req: await createIpareReqeust({
      secret: "secret",
    }),
  })
    .useJwt({
      secret: "secret",
    })
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
  expect(res.status).toBe(200);
});

function testGetToken(skip: boolean) {
  test("getToken option", async function () {
    const res = await new TestStartup({
      req: await createIpareReqeust({
        secret: "secret",
      }),
    })
      .useJwt({
        secret: "secret",
        getToken: () => "test",
      })
      .useJwtVerify(() => skip)
      .add(TestMiddleware)
      .run();
    expect(res.status).toBe(skip ? 200 : 401);
  });
}

testGetToken(true);
testGetToken(false);
