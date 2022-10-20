import { TestStartup } from "@ipare/testing";
import { createTestContext } from "./utils";
import "../src";
import { Context } from "@ipare/core";

function testErrorSecret(isError: boolean) {
  function runTest(customError: boolean) {
    test(`error secret ${isError} ${customError}`, async function () {
      process.env.IS_IPARE_HTTP = "true";
      const startup = new TestStartup()
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
                ctx.bag("result", err.message);
              }
            : undefined
        )
        .use((ctx) => {
          ctx.bag("result", true);
        });

      let ctx: Context | undefined;
      let error = false;
      try {
        const res = await startup.run();
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
          expect(ctx.bag("result")).toBeTruthy();
        } else {
          if (customError) {
            expect(ctx.bag("result")).toBe("invalid signature");
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
