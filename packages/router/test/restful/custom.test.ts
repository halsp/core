import "../UseTest";
import "../../src";
import { HttpMethod, TestStartup, Request } from "sfa";

test(`custom httpMethod test`, async function () {
  HttpMethod.custom.push("CUSTOM");
  const result = await new TestStartup(
    new Request().setPath("/restful/1").setMethod("CUSTOM")
  )
    .useTest()
    .useRouter<TestStartup>()
    .run();
  expect(result.status).toBe(200);
});

test(`custom httpMethod test err`, async function () {
  HttpMethod.custom.splice(0);
  const result = await new TestStartup(
    new Request().setPath("/restful/1").setMethod("CUSTOM")
  )
    .useTest()
    .useRouter<TestStartup>()
    .run();
  expect(result.status).toBe(405);
});
