import "../UseTest";
import "../../src";
import { TestStartup, SfaRequest } from "sfa";
import { HttpMethod } from "@sfajs/header";

test(`action name error`, async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/err").setMethod(HttpMethod.post)
  )
    .useTest()
    .useRouter()
    .run();

  expect(result.status).toBe(405);
});

test(`without method`, async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/restful").setMethod("")
  )
    .useTest()
    .useRouter()
    .run();

  expect(result.status).toBe(200);
  expect(result.body).toEqual({
    method: "ANY",
  });
});
