import { ErrorMessage } from "../../src";
import StatusCode from "../../src/Response/StatusCode";
import { SimpleStartup } from "../../src";

test("router test", async function () {
  const result = await new SimpleStartup()
    .use(async (ctx) => {
      ctx.res.status = StatusCode.badRequest;
      ctx.res.body = <ErrorMessage>{ message: "br" };
    })
    .run();

  expect(result.status).toBe(StatusCode.badRequest);
  expect((result.body as ErrorMessage).message).toBe("br");
});
