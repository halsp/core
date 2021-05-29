import "../UseTest";
import "../../src";
import { HttpMethod, Startup, Request } from "sfa";

test(`custom httpMethod test`, async function () {
  HttpMethod.custom.push("CUSTOM");
  const result = await new Startup(
    new Request().setPath("/restful/1").setMethod("CUSTOM")
  )
    .useTest()
    .useRouter()
    .invoke();
  expect(result.status).toBe(200);
});

test(`custom httpMethod test err`, async function () {
  HttpMethod.custom.splice(0);
  const result = await new Startup(
    new Request().setPath("/restful/1").setMethod("CUSTOM")
  )
    .useTest()
    .useRouter()
    .invoke();
  expect(result.status).toBe(405);
});
