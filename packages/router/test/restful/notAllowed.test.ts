import "../UseTest";
import "../../src";
import { SimpleStartup, Request } from "sfa";

test(`method not allowed`, async function () {
  const result = await new SimpleStartup(
    new Request().setPath("/restful/1").setMethod("NO")
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(405);
});
