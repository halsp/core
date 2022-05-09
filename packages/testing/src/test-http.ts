import { SfaHttp } from "@sfajs/http";
import supertest from "supertest";
import net from "net";

export class TestHttp extends SfaHttp {
  constructor(root?: string) {
    TestHttp["CUSTOM_CONFIG_ROOT"] = root;
    super();
  }

  async run(
    func: (
      request: supertest.SuperTest<supertest.Test>
    ) => supertest.Test | Promise<supertest.Test>,
    port = 80,
    hostName?: string
  ): Promise<supertest.Response> {
    const server = await this.#listen(port, hostName);
    try {
      return await func(supertest(server));
    } finally {
      server.close();
    }
  }

  #listen(port: number, hostName?: string) {
    return new Promise<net.Server>((resolve, reject) => {
      const server = this.listen(port, hostName);
      server.on("listening", () => {
        console.log(`start: http://localhost:${port}`);
        resolve(server);
      });
      server.on("error", (err) => {
        if (err.code == "EADDRINUSE") {
          this.#listen(port + 1).then((svr) => {
            resolve(svr);
          });
        } else {
          reject(err);
        }
      });
    });
  }
}
