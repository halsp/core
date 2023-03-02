import { BodyPraserStartup } from "../src";
import * as http from "http";
import { Context, Dict, Request } from "@halsp/common";
import { NumericalHeadersDict } from "@halsp/http";
import qs from "qs";

declare module "@halsp/common" {
  interface Context {
    get reqStream(): http.IncomingMessage;
    get resStream(): http.ServerResponse;
  }
}

export class TestBodyParserStartup extends BodyPraserStartup {
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
    const pathname = (reqStream.url as string).split("?")[0];
    const query = qs.parse((reqStream.url as string).split("?")[1] ?? "");
    const req = new Request()
      .setPath(pathname)
      .setMethod(reqStream.method as string)
      .setQuery(query as Dict<string>)
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
