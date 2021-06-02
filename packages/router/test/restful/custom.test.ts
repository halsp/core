import "../UseTest";
import "../../src";
import { HttpMethod, SimpleStartup, Request } from "sfa";

test(`custom httpMethod test`, async function () {
  HttpMethod.custom.push("CUSTOM");
  const result = await new SimpleStartup(
    new Request().setPath("/restful/1").setMethod("CUSTOM")
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(200);
});

test(`custom httpMethod test err`, async function () {
  HttpMethod.custom.splice(0);
  const result = await new SimpleStartup(
    new Request().setPath("/restful/1").setMethod("CUSTOM")
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(405);
});
