import * as net from "net";
import * as tls from "tls";
import HttpBodyPraserStartup from "./http-body-praser.startup";
import * as http from "http";
import {
  HttpContext,
  SfaRequest,
  SfaResponse,
  Dict,
  NumericalHeadersDict,
  isPlainObject,
} from "@sfajs/core";
import * as urlParse from "url-parse";
import { Stream } from "stream";

export default abstract class HttpStartup extends HttpBodyPraserStartup {
  constructor() {
    super((ctx) => ctx.httpReq);
  }

  abstract readonly server: net.Server | tls.Server;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public get listen() {
    return this.server.listen.bind(this.server);
  }

  protected requestListener = async (
    httpReq: http.IncomingMessage,
    httpRes: http.ServerResponse
  ): Promise<void> => {
    const url = urlParse(httpReq.url as string, true);
    const ctx = new HttpContext(
      new SfaRequest()
        .setPath(url.pathname)
        .setMethod(httpReq.method as string)
        .setQuery(url.query as Dict<string>)
        .setHeaders(httpReq.headers as NumericalHeadersDict)
    );

    httpRes.statusCode = 404;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).httpRes = httpRes;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).httpReq = httpReq;

    const sfaRes = await this.invoke(ctx);

    if (!httpRes.writableEnded) {
      httpRes.statusCode = sfaRes.status;
      this.writeHead(sfaRes, httpRes);
      this.writeBody(sfaRes, httpRes);
    }
  };

  private writeHead(sfaRes: SfaResponse, httpRes: http.ServerResponse) {
    if (httpRes.headersSent) return;
    Object.keys(sfaRes.headers)
      .filter((key) => !!sfaRes.headers[key])
      .forEach((key) => {
        httpRes.setHeader(key, sfaRes.headers[key] as string | string[]);
      });
  }

  private writeBody(sfaRes: SfaResponse, httpRes: http.ServerResponse) {
    if (!sfaRes.body) {
      if (!httpRes.headersSent) {
        httpRes.removeHeader("Content-Type");
        httpRes.removeHeader("Content-Length");
      }
      httpRes.end();
      return;
    }

    if (sfaRes.body instanceof Stream) {
      sfaRes.body.pipe(httpRes);
    } else if (isPlainObject(sfaRes.body)) {
      const str = JSON.stringify(sfaRes.body);
      httpRes.end(str);
    } else {
      httpRes.end(sfaRes.body);
    }
  }
}
