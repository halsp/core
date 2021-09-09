import "../UseTest";
import "../../src";
import { TestStartup, SfaRequest } from "sfa";

test(`method not allowed`, async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/restful/1").setMethod("NO")
  )
    .useTest()
    .useRouter()
    .run();
  expect(result.status).toBe(405);
});
