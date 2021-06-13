import "../UseTest";
import "../../src";
import { HttpMethod, TestStartup, Request } from "sfa";

test(`action name error`, async function () {
  const result = await new TestStartup(
    new Request().setPath("/err").setMethod(HttpMethod.post)
  )
    .useTest()
    .useRouter<TestStartup>()
    .run();

  expect(result.status).toBe(404);
});
