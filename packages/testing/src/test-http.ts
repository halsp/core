import { HttpStartup } from "@sfajs/http";
import supertest, { Response, SuperTest, Test } from "supertest";

export class TestHttpStartup extends HttpStartup {
  constructor(root?: string) {
    TestHttpStartup["CUSTOM_CONFIG_ROOT"] = root;
    super();
  }

  async run(
    func: (request: SuperTest<Test>) => Response | Promise<Response>,
    port = 2333,
    hostName?: string
  ): Promise<Response> {
    const listenResult = await this.dynamicListen(port, hostName);
    console.log(`start: http://localhost:${listenResult.port}`);
    try {
      return await func(supertest(listenResult.server));
    } finally {
      listenResult.server.close();
    }
  }
}
