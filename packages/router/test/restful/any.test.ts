import "../UseTest";
import "../../src";
import { HttpMethod, SimpleStartup, Request } from "sfa";

const methods = ["test", "aaa", "NO"];

methods.forEach((method) => {
  test(`${method} -> any restful test`, async function () {
    const result = await new SimpleStartup(
      new Request().setPath("/restful").setMethod(method)
    )
      .useTest()
      .useRouter<SimpleStartup>()
      .run();

    expect(result.status).toBe(200);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(!!(result.body as any).method).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result.body as any).method).toBe(HttpMethod.any);
  });
});
