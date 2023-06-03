import "@halsp/testing";
import "../src";
import { JwtService } from "../src";
import { createTestContext } from "./utils";
import { Startup } from "@halsp/core";

beforeEach(() => {
  process.env.HALSP_ENV = "" as any;
});

describe("auth", () => {
  function runAuthTest(auth: boolean) {
    it(`should auth ${auth}`, async function () {
      const { ctx } = await new Startup()
        .use(async (ctx, next) => {
          ctx.set("result", false);
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
        .use((ctx) => ctx.set("result", true))
        .test();
      expect(ctx.get("result")).toBe(auth);
    });
  }
  runAuthTest(true);
  runAuthTest(false);

  it("should set 401 when use useJwtVerify in http", async () => {
    process.env.HALSP_ENV = "http";
    const { ctx } = await new Startup()
      .setContext(
        await createTestContext({
          secret: "secret",
        })
      )
      .use(async (ctx, next) => {
        ctx["unauthorizedMsg"] = (msg) => {
          ctx.set("msg", msg);
        };
        await next();
      })
      .useJwt({
        secret: "secret1",
      })
      .useJwtVerify()
      .test();
    expect(ctx.get("msg")).toBe("invalid signature");
  });

  it("should set 401 when use useJwtExtraAuth in http", async () => {
    process.env.HALSP_ENV = "http";
    const { ctx } = await new Startup()
      .setContext(
        await createTestContext({
          secret: "secret",
        })
      )
      .use(async (ctx, next) => {
        ctx["unauthorizedMsg"] = (msg: string) => {
          ctx.set("msg", msg);
        };
        ctx.res["status"] = 404;
        await next();
      })
      .useJwt({
        secret: "secret",
      })
      .useJwtExtraAuth(() => false)
      .test();
    expect(ctx.get("msg")).toBe("JWT validation failed");
  });

  it("should throw error when use useJwtVerify without env", async () => {
    process.env.HALSP_ENV = "" as any;
    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(!!err).toBeTruthy();
      })
      .setContext(
        await createTestContext({
          secret: "secret",
        })
      )
      .useJwt({
        secret: "secret",
      })
      .useJwtVerify()
      .test();
  });

  it(`should auth failed when use useJwtVerify in micro`, async function () {
    const startup = new Startup();
    const context = await createTestContext({
      secret: "secret",
    });
    process.env.HALSP_ENV = "micro";
    const { ctx } = await startup
      .setContext(context)
      .useJwt({
        secret: "secret",
      })
      .useJwtVerify()
      .test();

    expect(ctx.res["error"].message).toBe("jwt must be provided");
  });

  it(`should auth success with empty body and default verify when use micro`, async function () {
    process.env.HALSP_ENV = "micro";
    const testCtx = await createTestContext({
      secret: "secret",
    });
    testCtx.req.setBody({
      token: testCtx.req["headers"]["Authorization"],
    });

    const { ctx } = await new Startup()
      .setContext(testCtx)
      .useJwt({
        secret: "secret",
      })
      .useJwtVerify()
      .use((ctx) => ctx.set("result", true))
      .test();
    expect(ctx.get("result")).toBe(true);
  });

  it(`should auth failed with custom status when use micro`, async function () {
    process.env.HALSP_ENV = "micro";
    const { ctx } = await new Startup()
      .setContext(
        await createTestContext({
          secret: "secret",
        })
      )
      .useJwt({
        secret: "secret",
      })
      .useJwtExtraAuth(async (ctx) => {
        ctx.set("extra", true);
        return false;
      })
      .use((ctx) => ctx.set("extra", false))
      .test();
    expect(ctx.get("extra")).toBeTruthy();
  });

  it(`should auth with null token`, async function () {
    const { ctx } = await new Startup()
      .useJwt({
        secret: "secret",
      })
      .use(async (ctx) => {
        const jwtService = await ctx.getService(JwtService);
        try {
          await jwtService.verify(null as any);
          ctx.set("result", false);
        } catch (ex) {
          ctx.set("result", true);
        }
      })
      .test();
    expect(ctx.get("result")).toBeTruthy();
  });
});
