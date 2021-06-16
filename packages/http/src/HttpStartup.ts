import * as net from "net";
import * as tls from "tls";
import HttpBodyPraserStartup from "./HttpBodyPraserStartup";
import * as http from "http";
import { HttpContext, Request, Response } from "sfa";
import * as urlParse from "url-parse";
import { Stream } from "stream";
import * as mime from "mime-types";

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
      new Request()
        .setPath(url.pathname)
        .setMethod(httpReq.method as string)
        .setParams(url.query)
        .setHeaders(httpReq.headers)
    );
    ctx.res.setHeader("sfa-http", "https://github.com/sfajs/http");

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

  private writeHead(sfaRes: Response, httpRes: http.ServerResponse) {
    if (httpRes.headersSent) return;
    Object.keys(sfaRes.headers)
      .filter((key) => !!sfaRes.headers[key])
      .forEach((key) => {
        httpRes.setHeader(key, sfaRes.headers[key] as string | string[]);
      });
  }

  private writeBody(sfaRes: Response, httpRes: http.ServerResponse) {
    if (!sfaRes.body) {
      if (!httpRes.headersSent) {
        httpRes.removeHeader("Content-Type");
        httpRes.removeHeader("Content-Length");
      }
      httpRes.end();
      return;
    }

    const writeType =
      !sfaRes.hasHeader("content-type") && !httpRes.hasHeader("Content-Type");
    const writeLength =
      !sfaRes.hasHeader("content-length") &&
      !httpRes.hasHeader("Content-Length");

    if (typeof sfaRes.body == "string") {
      if (writeLength) {
        httpRes.setHeader("Content-Length", Buffer.byteLength(sfaRes.body));
      }
      if (writeType) {
        const type = /^\s*</.test(sfaRes.body) ? "html" : "text";
        httpRes.setHeader("Content-Type", mime.contentType(type) as string);
      }
      httpRes.end(sfaRes.body);
    } else if (Buffer.isBuffer(sfaRes.body)) {
      if (writeLength) {
        httpRes.setHeader("Content-Length", sfaRes.body.byteLength);
      }
      if (writeType) {
        httpRes.setHeader("Content-Type", mime.contentType("bin") as string);
      }
      httpRes.end(sfaRes.body);
    } else if (sfaRes.body instanceof Stream) {
      if (writeType) {
        httpRes.setHeader("Content-Type", mime.contentType("bin") as string);
      }
      sfaRes.body.pipe(httpRes);
    } else {
      const str = JSON.stringify(sfaRes.body);
      if (writeLength) {
        httpRes.setHeader("Content-Length", Buffer.byteLength(str));
      }
      if (writeType) {
        httpRes.setHeader("Content-Type", mime.contentType("json") as string);
      }
      httpRes.end(str);
    }
  }
}
