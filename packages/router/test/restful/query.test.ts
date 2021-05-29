import { HttpMethod, Startup, Request } from "sfa";
import "../UseTest";
import "../../src";

test(`restful query test1`, async function () {
  const result = await new Startup(
    new Request().setPath("/restful/45").setMethod(HttpMethod.get)
  )
    .useTest()
    .useRouter()
    .invoke();
  expect(result.status).toBe(200);
  expect((result.body as Record<string, unknown>).id).toBe("45");
});

test(`restful query test2`, async function () {
  const result = await new Startup(
    new Request().setPath("/restful/11/animals").setMethod(HttpMethod.get)
  )
    .useTest()
    .useRouter()
    .invoke();
  expect(result.status).toBe(200);
  expect((result.body as Record<string, unknown>).id).toBe("11");
});
