import { BodyPraserStartup } from "../src";
import * as http from "http";
import { Dict } from "@halsp/common";
import { HttpContext, HttpRequest, NumericalHeadersDict } from "@halsp/http";
import qs from "qs";

declare module "@halsp/http" {
  interface HttpContext {
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
    const req = new HttpRequest()
      .setPath(pathname)
      .setMethod(reqStream.method as string)
      .setQuery(query as Dict<string>)
      .setHeaders(reqStream.headers as NumericalHeadersDict);
    const ctx = new HttpContext(req);
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
