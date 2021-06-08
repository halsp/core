import { StatusCodes } from "http-status-codes";
import { ErrorMessage } from "../../src";
import { SimpleStartup } from "../../src";

test("response error", async function () {
  const result = await new SimpleStartup()
    .use(async (ctx) => {
      ctx.res.status = StatusCodes.BAD_REQUEST;
      ctx.res.body = <ErrorMessage>{ message: "error msg" };
    })
    .run();

  expect(result.status).toBe(400);
  expect(result.isSuccess).toBeFalsy();
  expect((result.body as ErrorMessage).message).toBe("error msg");
});
