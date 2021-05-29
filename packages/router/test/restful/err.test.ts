import "../UseTest";
import "../../src";
import { HttpMethod, Startup, Request } from "sfa";

test(`action name error`, async function () {
  const result = await new Startup(
    new Request().setPath("/err").setMethod(HttpMethod.post)
  )
    .useTest()
    .useRouter()
    .invoke();

  expect(result.status).toBe(404);
});
