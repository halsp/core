import "../UseTest";
import "../../src";
import { HttpMethod, TestStartup, Request } from "sfa";

const methods = ["test", "aaa", "NO"];

methods.forEach((method) => {
  test(`${method} -> any restful test`, async function () {
    const result = await new TestStartup(
      new Request().setPath("/restful").setMethod(method)
    )
      .useTest()
      .useRouter()
      .run();

    expect(result.status).toBe(200);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(!!(result.body as any).method).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result.body as any).method).toBe(HttpMethod.any);
  });
});
