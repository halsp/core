import "../UseTest";
import "../../src";
import { TestStartup, SfaRequest } from "sfa";
import { HttpMethod } from "@sfajs/header";

const methods = ["test", "aaa", "NO"];

methods.forEach((method) => {
  test(`${method} -> any restful test`, async function () {
    const result = await new TestStartup(
      new SfaRequest().setPath("/restful").setMethod(method)
    )
      .useTest()
      .useRouter()
      .run();

    expect(result.status).toBe(200);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(!!result.body.method).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(result.body.method).toBe(HttpMethod.any);
  });
});
