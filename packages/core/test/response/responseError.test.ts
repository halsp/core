/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import { HttpErrorMessage } from "../../src";
import { TestStartup } from "../../src";

test("response error message", async function () {
  const result = await new TestStartup()
    .use(async (ctx) => {
      ctx.res
        .setStatus(StatusCodes.BAD_REQUEST)
        .setBody(<HttpErrorMessage>{ message: "error msg" });
    })
    .run();

  expect(result.status).toBe(400);
  expect(result.isSuccess).toBeFalsy();
  expect(result.body.message).toBe("error msg");
});
