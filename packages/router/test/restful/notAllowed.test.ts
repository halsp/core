import "../UseTest";
import "../../src";
import { TestStartup, Request } from "sfa";

test(`method not allowed`, async function () {
  const result = await new TestStartup(
    new Request().setPath("/restful/1").setMethod("NO")
  )
    .useTest()
    .useRouter()
    .run();
  expect(result.status).toBe(405);
});
