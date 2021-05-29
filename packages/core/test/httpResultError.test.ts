import { ErrorMessage, Startup } from "../src";
import StatusCode from "../src/Response/StatusCode";
import Request from "../src/Request";

test("router test", async function () {
  const result = await new Startup(
    new Request().setHeader("custom-header", "aaa")
  )
    .use(async (ctx) => {
      ctx.res.status = StatusCode.badRequest;
      ctx.res.body = <ErrorMessage>{ message: "br" };
    })
    .invoke();

  expect(result.status).toBe(StatusCode.badRequest);
  expect((result.body as ErrorMessage).message).toBe("br");
});
