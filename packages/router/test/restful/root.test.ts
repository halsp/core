import { HttpMethod, SimpleStartup, Request } from "sfa";
import "../UseTest";
import "../../src";

test("restful root get", async function () {
  const result = await new SimpleStartup(
    new Request().setPath("/").setMethod(HttpMethod.get.toUpperCase())
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(200);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((result.body as any).method).toBe(HttpMethod.get);
});
