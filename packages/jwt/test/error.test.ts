import "@halsp/testing";
import { createTestContext } from "./utils";
import "../src";
import { Startup } from "@halsp/core";

describe("error", () => {
  it("should throw error when secret is error", async () => {
    process.env.HALSP_ENV = "http";
    const { ctx } = await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(!!err).toBeTruthy();
      })
      .setContext(
        await createTestContext({
          secret: "secret1",
        }),
      )
      .useJwt({
        secret: "secret",
      })
      .useJwtVerify()
      .use((ctx) => {
        ctx.set("result", true);
      })
      .test();

    expect(ctx.get("result")).toBeUndefined();
  });

  it("should throw error with customError", async () => {
    process.env.HALSP_ENV = "http";
    const { ctx } = await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(!!err).toBeFalsy();
      })
      .setContext(
        await createTestContext({
          secret: "secret1",
        }),
      )
      .useJwt({
        secret: "secret",
      })
      .useJwtVerify(undefined, (ctx, err) => {
        ctx.set("result", err.message);
      })
      .use((ctx) => {
        ctx.set("result", true);
      })
      .test();

    expect(ctx.get("result")).toBe("invalid signature");
  });
});
