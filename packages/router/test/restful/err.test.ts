import "../../src";
import { TestStartup, Request, HttpMethod } from "@ipare/core";
import "../global";

test(`action name error`, async () => {
  const result = await new TestStartup(
    new Request().setPath("/err").setMethod(HttpMethod.post)
  )
    .useTestRouter()
    .run();

  expect(result.status).toBe(405);
});

test(`without method`, async () => {
  const result = await new TestStartup(
    new Request().setPath("/restful").setMethod("")
  )
    .useTestRouter()
    .run();

  expect(result.status).toBe(200);
  expect(result.body).toEqual({
    method: "ANY",
  });
});
