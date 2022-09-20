import "../../src";
import { Request, HttpMethod } from "@ipare/http";
import { TestHttpStartup } from "@ipare/testing";
import "../global";

test(`action name error`, async () => {
  const result = await new TestHttpStartup()
    .setRequest(new Request().setPath("/err").setMethod(HttpMethod.post))
    .useTestRouter()
    .run();

  expect(result.status).toBe(405);
});

test(`without method`, async () => {
  const result = await new TestHttpStartup()
    .setRequest(new Request().setPath("/restful").setMethod(""))
    .useTestRouter()
    .run();

  expect(result.status).toBe(200);
  expect(result.body).toEqual({
    method: "ANY",
  });
});
