import { BodyPraserStartup } from "../../../src";
import * as http from "http";
import { Dict, Request } from "@ipare/core";
import urlParse from "url-parse";
import request from "supertest";
import { NumericalHeadersDict } from "@ipare/http";

class TestServerStartup extends BodyPraserStartup {
  constructor() {
    super((ctx) => ctx.serverReq);
  }

  public get listen() {
    const server = http.createServer(this.requestListener);
    return server.listen.bind(server);
  }

  protected requestListener = async (
    serverReq: http.IncomingMessage,
    serverRes: http.ServerResponse
  ): Promise<void> => {
    const url = urlParse(serverReq.url as string, true);
    await this.invoke(
      new Request()
        .setPath(url.pathname)
        .setMethod(serverReq.method as string)
        .setQuery(url.query as Dict<string>)
        .setHeaders(serverReq.headers as NumericalHeadersDict)
    );
    serverRes.statusCode = 401;
    serverRes.end();
  };
}

test("custom startup", async () => {
  const server = new TestServerStartup().listen();
  const res = await request(server).post("");
  server.close();

  expect(res.status).toBe(401);
});
