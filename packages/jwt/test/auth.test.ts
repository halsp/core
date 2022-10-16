import { TestStartup } from "@ipare/testing";
import { parseInject } from "@ipare/inject";
import "../src";
import { JwtService } from "../src";
import { createTestContext } from "./utils";

describe("auth", () => {
  function runAuthTest(auth: boolean) {
    it(`should auth ${auth}`, async function () {
      const ctx = await new TestStartup()
        .use(async (ctx, next) => {
          ctx.bag("result", false);
          await next();
        })
        .setContext(
          await createTestContext({
            secret: "secret",
          })
        )
        .useJwt({
          secret: "secret",
        })
        .useJwtExtraAuth(() => auth)
        .use((ctx) => ctx.bag("result", true))
        .run();
      expect(ctx.bag("result")).toBe(auth);
    });
  }
  runAuthTest(true);
  runAuthTest(false);

  it("should set 401 when use useJwtVerify in http", async () => {
    const ctx = await new TestStartup()
      .setContext(
        await createTestContext({
          secret: "secret",
        })
      )
      .use(async (ctx, next) => {
        (ctx as any).unauthorizedMsg = (msg) => {
          ctx.bag("msg", msg);
        };
        await next();
      })
      .useJwt({
        secret: "secret1",
      })
      .useJwtVerify()
      .run();
    expect(ctx.bag("msg")).toBe("invalid signature");
  });

  it("should set 401 when use useJwtExtraAuth in http", async () => {
    process.env.IS_IPARE_HTTP = "true";
    const ctx = await new TestStartup()
      .setContext(
        await createTestContext({
          secret: "secret",
        })
      )
      .use(async (ctx, next) => {
        (ctx as any).unauthorizedMsg = (msg: string) => {
          ctx.bag("msg", msg);
        };
        (ctx as any).res = {
          status: 404,
        };
        await next();
      })
      .useJwt({
        secret: "secret",
      })
      .useJwtExtraAuth(() => false)
      .run();
    expect(ctx.bag("msg")).toBe("JWT validation failed");
  });

  it(`should auth failed with custom status`, async function () {
    process.env.IS_IPARE_HTTP = "" as any;
    process.env.IS_IPARE_MICRO = "true";
    const ctx = await new TestStartup()
      .setContext(
        await createTestContext({
          secret: "secret",
        })
      )
      .useJwt({
        secret: "secret",
      })
      .useJwtExtraAuth(async (ctx) => {
        ctx.bag("extra", true);
        return false;
      })
      .use((ctx) => ctx.bag("extra", false))
      .run();
    expect(ctx.bag("extra")).toBeTruthy();
  });

  it(`should auth with null token`, async function () {
    const ctx = await new TestStartup()
      .useJwt({
        secret: "secret",
      })
      .use(async (ctx) => {
        const jwtService = await parseInject(ctx, JwtService);
        try {
          await jwtService.verify(null as any);
          ctx.bag("result", false);
        } catch (ex) {
          ctx.bag("result", true);
        }
      })
      .run();
    expect(ctx.bag("result")).toBeTruthy();
  });
});
