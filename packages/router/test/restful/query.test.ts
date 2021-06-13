import { HttpMethod, TestStartup, Request } from "sfa";
import "../UseTest";
import "../../src";

test(`restful query test1`, async function () {
  const result = await new TestStartup(
    new Request().setPath("/restful/45").setMethod(HttpMethod.get)
  )
    .useTest()
    .useRouter<TestStartup>()
    .run();
  expect(result.status).toBe(200);
  expect((result.body as Record<string, unknown>).id).toBe("45");
});

test(`restful query test2`, async function () {
  const result = await new TestStartup(
    new Request().setPath("/restful/11/animals").setMethod(HttpMethod.get)
  )
    .useTest()
    .useRouter<TestStartup>()
    .run();
  expect(result.status).toBe(200);
  expect((result.body as Record<string, unknown>).id).toBe("11");
});
