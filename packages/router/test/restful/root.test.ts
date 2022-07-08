import { TestStartup, Request, HttpMethod } from "@sfajs/core";
import "../../src";
import "../global";

test("restful root get", async () => {
  const result = await new TestStartup(
    new Request().setPath("/").setMethod(HttpMethod.get.toUpperCase())
  )
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
  expect(result.body.method).toBe(HttpMethod.get);
});
