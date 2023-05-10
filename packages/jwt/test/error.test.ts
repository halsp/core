import "@halsp/testing";
import { createTestContext } from "./utils";
import "../src";
import { Context, Startup } from "@halsp/core";

function testErrorSecret(isError: boolean) {
  function runTest(customError: boolean) {
    test(`error secret ${isError} ${customError}`, async function () {
      process.env.HALSP_ENV = "http";
      const startup = new Startup()
        .setContext(
          await createTestContext({
            secret: isError ? "secret1" : "secret",
          })
        )
        .useJwt({
          secret: "secret",
        })
        .useJwtVerify(
          undefined,
          customError
            ? (ctx, err) => {
                ctx.set("result", err.message);
              }
            : undefined
        )
        .use((ctx) => {
          ctx.set("result", true);
        });

      let ctx: Context | undefined;
      let error = false;
      try {
        const res = await startup.test();
        ctx = res.ctx;
      } catch (err) {
        console.log(err);
        error = true;
      }

      if (isError && !customError) {
        expect(error).toBeTruthy();
      } else {
        expect(error).toBeFalsy();
        if (!ctx) throw new Error();

        if (!isError) {
          expect(ctx.get("result")).toBeTruthy();
        } else {
          if (customError) {
            expect(ctx.get("result")).toBe("invalid signature");
          }
        }
      }
    });
  }

  runTest(true);
  runTest(false);
}

testErrorSecret(true);
testErrorSecret(false);
