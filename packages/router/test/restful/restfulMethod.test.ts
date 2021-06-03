import { HttpMethod, SimpleStartup, Request } from "sfa";
import "../UseTest";
import "../../src";

const methods = [
  HttpMethod.get,
  HttpMethod.connect,
  HttpMethod.delete,
  HttpMethod.post,
  HttpMethod.head,
  HttpMethod.options,
  HttpMethod.patch,
  HttpMethod.put,
  HttpMethod.trace,
];

methods.forEach((method) => {
  test(`${method} restful test`, async function () {
    const result = await new SimpleStartup(
      new Request().setPath("/restful").setMethod(method)
    )
      .useTest()
      .useRouter<SimpleStartup>()
      .run();
    expect(result.status).toBe(200);
    expect((result.body as Record<string, unknown>).method).toBe(method);
  });
});