import "../../src";
import { HttpMethod } from "@ipare/http";
import { Request } from "@ipare/core";
import { TestHttpStartup } from "@ipare/testing-http";
import "../global";

test(`action name error`, async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setPath("/err").setMethod(HttpMethod.post))
    .useTestRouter()
    .run();

  expect(result.status).toBe(405);
});

test(`without method`, async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setPath("/restful").setMethod(""))
    .useTestRouter()
    .run();

  expect(result.status).toBe(200);
  expect(result.body).toEqual({
    method: "ANY",
  });
});
