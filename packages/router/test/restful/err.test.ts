import "../../src";
import { Request, HttpMethod } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../global";

test(`action name error`, async () => {
  const result = await new TestStartup()
    .setRequest(new Request().setPath("/err").setMethod(HttpMethod.post))
    .useTestRouter()
    .run();

  expect(result.status).toBe(405);
});

test(`without method`, async () => {
  const result = await new TestStartup()
    .setRequest(new Request().setPath("/restful").setMethod(""))
    .useTestRouter()
    .run();

  expect(result.status).toBe(200);
  expect(result.body).toEqual({
    method: "ANY",
  });
});
