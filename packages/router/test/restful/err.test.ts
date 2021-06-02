import "../UseTest";
import "../../src";
import { HttpMethod, SimpleStartup, Request } from "sfa";

test(`action name error`, async function () {
  const result = await new SimpleStartup(
    new Request().setPath("/err").setMethod(HttpMethod.post)
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();

  expect(result.status).toBe(404);
});
