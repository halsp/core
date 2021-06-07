import { ErrorMessage } from "../../src";
import { SimpleStartup } from "../../src";

test("response error", async function () {
  const result = await new SimpleStartup()
    .use(async (ctx) => {
      ctx.res.status = 400;
      ctx.res.body = <ErrorMessage>{ message: "br" };
    })
    .run();

  expect(result.status).toBe(400);
  expect((result.body as ErrorMessage).message).toBe("br");
});
