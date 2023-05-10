import { Middleware, Startup } from "@halsp/core";
import * as jwt from "jsonwebtoken";
import { JwtObject, JwtPayload, JwtToken } from "../src";
import "../src";
import { createTestContext } from "./utils";
import "@halsp/testing";

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
    this.ctx.set("jwt", this.jwt);
    this.ctx.set("payload", this.payload);
    this.ctx.set("str1", this.str1);
    this.ctx.set("str2", this.str2);
  }
}

test("decorator", async function () {
  let jwt = "";
  process.env.HALSP_ENV = "http";
  const { ctx } = await new Startup()
    .setContext(
      await createTestContext({
        secret: "secret",
      })
    )
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
    .test();
  expect(Object.keys(ctx.get("jwt"))).toEqual([
    "header",
    "payload",
    "signature",
  ]);
  expect(Object.keys(ctx.get("payload"))).toEqual(["iat"]);
  expect(ctx.get("payload")).toEqual(ctx.get<jwt.Jwt>("jwt")["payload"]);
  expect(ctx.get("str1")).toBe(jwt);
  expect(ctx.get("str2")).toBe(jwt);
});

function testGetToken(skip: boolean) {
  test("tokenProvider option", async function () {
    const startup = new Startup()
      .setContext(
        await createTestContext({
          secret: "secret",
        })
      )
      .useJwt({
        secret: "secret",
        tokenProvider: () => "test",
      })
      .useJwtVerify(() => skip)
      .add(TestMiddleware);

    let error = false;
    try {
      await startup.test();
    } catch {
      error = true;
    }
    expect(error).toBe(!skip);
  });
}

testGetToken(true);
testGetToken(false);
