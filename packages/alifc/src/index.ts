import { HttpContext, Request, Response } from "sfa";
import "sfa";
import * as mime from "mime-types";
import * as http from "http";
import { HttpBodyPraserStartup } from "@sfajs/http";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AliContext = any;

export type AliRes = {
  statusCode: number;
  headers: Record<string, string>;
  setStatusCode: (code: number) => void;
  setHeader: (key: string, val: string) => void;
  deleteHeader: (key: string) => void;
  hasHeader: (key: string) => boolean;
  send: (val: string | Buffer) => void;
};

export type AliReq = {
  path: string;
  method: string;
  url: string;
  clientIP: string;
  headers: Record<string, string>;
  queries: Record<string, string>;
} & http.IncomingMessage;

declare module "sfa" {
  interface HttpContext {
    readonly aliContext: AliContext;
    readonly aliReq: AliReq;
    readonly aliRes: AliRes;
  }
}

export default class SfaAlifunc extends HttpBodyPraserStartup {
  constructor(
    private readonly aliReq: AliReq,
    private readonly aliRes: AliRes,
    private readonly aliContext: AliContext
  ) {
    super((ctx) => ctx.aliReq);
  }

  async run(): Promise<void> {
    const ctx = new HttpContext(
      new Request()
        .setPath(this.aliReq.path)
        .setHeaders(this.aliReq.headers)
        .setParams(this.aliReq.queries)
        .setMethod(this.aliReq.method)
    );
    ctx.res.setHeader("sfa-alifunc", "https://github.com/sfajs/alifunc");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).aliContext = this.aliContext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).aliReq = this.aliReq;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).aliRes = this.aliRes;

    const sfaRes = await this.invoke(ctx);

    this.aliRes.statusCode = sfaRes.status;
    Object.keys(sfaRes.headers)
      .filter((key) => !!sfaRes.headers[key])
      .forEach((key) => {
        this.aliRes.setHeader(key, sfaRes.headers[key] as string);
      });
    this.writeBody(sfaRes, this.aliRes);

    return;
  }

  private writeBody(sfaRes: Response, aliRes: AliRes) {
    if (!sfaRes.body) {
      aliRes.send("");
      return;
    }

    const writeType =
      !sfaRes.hasHeader("content-type") &&
      !aliRes.hasHeader("Content-Type") &&
      !aliRes.hasHeader("content-type");
    const writeLength =
      !sfaRes.hasHeader("content-length") &&
      !aliRes.hasHeader("Content-Length") &&
      !aliRes.hasHeader("content-length");

    if (typeof sfaRes.body == "string") {
      if (writeLength) {
        aliRes.setHeader(
          "Content-Length",
          Buffer.byteLength(sfaRes.body).toString()
        );
      }
      if (writeType) {
        const type = /^\s*</.test(sfaRes.body) ? "html" : "text";
        aliRes.setHeader("Content-Type", mime.contentType(type) as string);
      }
      aliRes.send(sfaRes.body);
    } else if (Buffer.isBuffer(sfaRes.body)) {
      if (writeLength) {
        aliRes.setHeader("Content-Length", sfaRes.body.byteLength.toString());
      }
      if (writeType) {
        aliRes.setHeader("Content-Type", mime.contentType("bin") as string);
      }
      aliRes.send(sfaRes.body);
    } else {
      const str = JSON.stringify(sfaRes.body);
      if (writeLength) {
        aliRes.setHeader("Content-Length", Buffer.byteLength(str).toString());
      }
      if (writeType) {
        aliRes.setHeader("Content-Type", mime.contentType("json") as string);
      }
      aliRes.send(str);
    }
  }
}
