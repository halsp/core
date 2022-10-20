import { Middleware } from "@ipare/core";
import * as jwt from "jsonwebtoken";
import { JwtObject, JwtPayload, JwtToken } from "../src";
import "../src";
import { createTestContext } from "./utils";
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
    this.ctx.bag("jwt", this.jwt);
    this.ctx.bag("payload", this.payload);
    this.ctx.bag("str1", this.str1);
    this.ctx.bag("str2", this.str2);
  }
}

test("decorator", async function () {
  let jwt = "";
  process.env.IS_IPARE_HTTP = "true";
  const { ctx } = await new TestStartup()
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
    .run();
  expect(Object.keys(ctx.bag("jwt"))).toEqual([
    "header",
    "payload",
    "signature",
  ]);
  expect(Object.keys(ctx.bag("payload"))).toEqual(["iat"]);
  expect(ctx.bag("payload")).toEqual(ctx.bag<jwt.Jwt>("jwt")["payload"]);
  expect(ctx.bag("str1")).toBe(jwt);
  expect(ctx.bag("str2")).toBe(jwt);
});

function testGetToken(skip: boolean) {
  test("tokenProvider option", async function () {
    const startup = new TestStartup()
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
      await startup.run();
    } catch {
      error = true;
    }
    expect(error).toBe(!skip);
  });
}

testGetToken(true);
testGetToken(false);
