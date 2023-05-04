import { Startup } from "@halsp/core";
import { StatusCodes } from "../../src";

test("response error message", async () => {
  const result = await new Startup()
    .useHttp()
    .use(async (ctx) => {
      ctx.res
        .setStatus(StatusCodes.BAD_REQUEST)
        .setBody({ message: "error msg" });
    })
    ["invoke"]();

  expect(result.status).toBe(400);
  expect(result.isSuccess).toBeFalsy();
  expect(result.body.message).toBe("error msg");
});
