import "../UseTest";
import "../../src";
import { Startup, Request } from "sfa";

test(`method not allowed`, async function () {
  const result = await new Startup(
    new Request().setPath("/restful/1").setMethod("NO")
  )
    .useTest()
    .useRouter()
    .invoke();
  expect(result.status).toBe(405);
});
