import "../../src";
import { TestStartup, SfaRequest, HttpMethod } from "@sfajs/core";
import { routerCfg } from "../global";

const methods = ["test", "aaa", "NO"];

methods.forEach((method) => {
  test(`${method} -> any restful test`, async () => {
    const result = await new TestStartup(
      new SfaRequest().setPath("/restful").setMethod(method)
    )
      .useRouter(routerCfg)
      .run();

    expect(result.status).toBe(200);
    expect(!!result.body.method).toBe(true);
    expect(result.body.method).toBe(HttpMethod.any);
  });
});
