import { BodyPraserStartup } from "../../../src";
import * as http from "http";
import { HttpContext, Request, Dict, NumericalHeadersDict } from "@ipare/core";
import urlParse from "url-parse";
import request from "supertest";

class TestServerStartup extends BodyPraserStartup {
  constructor() {
    super((ctx) => ctx.httpReq);
  }

  public get listen() {
    const server = http.createServer(this.requestListener);
    return server.listen.bind(server);
  }

  protected requestListener = async (
    httpReq: http.IncomingMessage,
    httpRes: http.ServerResponse
  ): Promise<void> => {
    const url = urlParse(httpReq.url as string, true);
    const ctx = new HttpContext(
      new Request()
        .setPath(url.pathname)
        .setMethod(httpReq.method as string)
        .setQuery(url.query as Dict<string>)
        .setHeaders(httpReq.headers as NumericalHeadersDict)
    );

    await this.invoke(ctx);
    httpRes.statusCode = 401;
    httpRes.end();
  };
}

test("custom startup", async () => {
  const server = new TestServerStartup().listen();
  const res = await request(server).post("");
  server.close();

  expect(res.status).toBe(401);
});
