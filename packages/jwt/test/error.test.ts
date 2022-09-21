import { TestStartup } from "@ipare/testing";
import { createTestContext } from "./utils";
import "../src";
import { Context } from "@ipare/core";

function testErrorSecret(isError: boolean) {
  function runTest(customError: boolean) {
    test(`error secret ${isError} ${customError}`, async function () {
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
        ctx = await startup.run();
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
