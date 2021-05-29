import { HttpMethod, Startup, Request } from "sfa";
import "../UseTest";
import "../../src";

test("restful root get", async function () {
  const result = await new Startup(
    new Request().setPath("/").setMethod(HttpMethod.get.toUpperCase())
  )
    .useTest()
    .useRouter()
    .invoke();
  expect(result.status).toBe(200);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((result.body as any).method).toBe(HttpMethod.get);
});
