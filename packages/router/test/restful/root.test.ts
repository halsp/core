import { HttpMethod, TestStartup, Request } from "sfa";
import "../UseTest";
import "../../src";

test("restful root get", async function () {
  const result = await new TestStartup(
    new Request().setPath("/").setMethod(HttpMethod.get.toUpperCase())
  )
    .useTest()
    .useRouter()
    .run();
  expect(result.status).toBe(200);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(result.body.method).toBe(HttpMethod.get);
});
