/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import { ErrorMessage } from "../../src";
import { TestStartup } from "../../src";

test("response error message", async function () {
  const result = await new TestStartup()
    .use(async (ctx) => {
      ctx.res.status = StatusCodes.BAD_REQUEST;
      ctx.res.body = <ErrorMessage>{ message: "error msg" };
    })
    .run();

  expect(result.status).toBe(400);
  expect(result.isSuccess).toBeFalsy();
  expect((result.body as ErrorMessage).message).toBe("error msg");
});
