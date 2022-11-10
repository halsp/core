import { HttpBodyPraserStartup } from "../src";
import * as http from "http";
import { Context, Dict, Request } from "@ipare/core";
import urlParse from "url-parse";
import { NumericalHeadersDict } from "@ipare/http";

declare module "@ipare/core" {
  interface Context {
    get reqStream(): http.IncomingMessage;
    get resStream(): http.ServerResponse;
  }
}

export class TestBodyParserStartup extends HttpBodyPraserStartup {
  constructor() {
    super((ctx) => ctx.reqStream);
  }

  public get listen() {
    const server = http.createServer(this.requestListener);
    return server.listen.bind(server);
  }

  protected requestListener = async (
    reqStream: http.IncomingMessage,
    resStream: http.ServerResponse
  ): Promise<void> => {
    const url = urlParse(reqStream.url as string, true);
    const req = new Request()
      .setPath(url.pathname)
      .setMethod(reqStream.method as string)
      .setQuery(url.query as Dict<string>)
      .setHeaders(reqStream.headers as NumericalHeadersDict);
    const ctx = new Context(req);
    Object.defineProperty(ctx, "resStream", {
      get: () => resStream,
    });
    Object.defineProperty(ctx, "reqStream", {
      get: () => reqStream,
    });

    await this.invoke(ctx);
    resStream.statusCode = ctx.res.status;
    resStream.end();
  };
}
