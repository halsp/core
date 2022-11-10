import { HttpBodyPraserStartup } from "../src";
import * as http from "http";
import { Context, Dict, Request } from "@ipare/core";
import urlParse from "url-parse";
import { NumericalHeadersDict } from "@ipare/http";

declare module "@ipare/core" {
  interface Context {
    get serverReq(): http.IncomingMessage;
    get serverRes(): http.ServerResponse;
  }
}

export class TestBodyParserStartup extends HttpBodyPraserStartup {
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
    const req = new Request()
      .setPath(url.pathname)
      .setMethod(serverReq.method as string)
      .setQuery(url.query as Dict<string>)
      .setHeaders(serverReq.headers as NumericalHeadersDict);
    const ctx = new Context(req);
    Object.defineProperty(ctx, "serverRes", {
      get: () => serverRes,
    });
    Object.defineProperty(ctx, "serverReq", {
      get: () => serverReq,
    });

    await this.invoke(ctx);
    serverRes.statusCode = ctx.res.status;
    serverRes.end();
  };
}
