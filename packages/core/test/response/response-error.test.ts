import { StatusCodes } from "../../src";
import { TestStartup } from "../test-startup";

test("response error message", async function () {
  const result = await new TestStartup()
    .use(async (ctx) => {
      ctx.res
        .setStatus(StatusCodes.BAD_REQUEST)
        .setBody({ message: "error msg" });
    })
    .run();

  expect(result.status).toBe(400);
  expect(result.isSuccess).toBeFalsy();
  expect(result.body.message).toBe("error msg");
});
