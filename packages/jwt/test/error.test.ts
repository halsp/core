import { TestHttpStartup } from "@ipare/testing";
import { createIpareReqeust } from "./utils";
import "../src";

function testErrorSecret(isError: boolean) {
  function runTest(customError: boolean) {
    test(`error secret ${isError}`, async function () {
      const result = await new TestHttpStartup()
        .setRequest(
          await createIpareReqeust({
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
                ctx.res.setHeader("err", err.message);
              }
            : undefined
        )
        .use((ctx) => {
          ctx.ok();
        })
        .run();
      expect(result.status).toBe(isError ? (customError ? 404 : 401) : 200);
      expect(result.getHeader("err")).toBe(
        isError && customError ? "invalid signature" : undefined
      );
    });
  }

  runTest(true);
  runTest(false);
}

testErrorSecret(true);
testErrorSecret(false);
