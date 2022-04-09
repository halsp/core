import {
  HttpContext,
  SfaRequest,
  SfaResponse,
  isPlainObject,
} from "@sfajs/core";
import "@sfajs/core";
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

declare module "@sfajs/core" {
  interface HttpContext {
    readonly aliContext: AliContext;
    readonly aliReq: AliReq;
    readonly aliRes: AliRes;
  }
}

export class SfaAlifunc extends HttpBodyPraserStartup {
  constructor() {
    super((ctx) => ctx.aliReq);
  }

  async run(
    aliReq: AliReq,
    aliRes: AliRes,
    aliContext: AliContext
  ): Promise<void> {
    const ctx = new HttpContext(
      new SfaRequest()
        .setPath(aliReq.path)
        .setHeaders(aliReq.headers)
        .setQuery(aliReq.queries)
        .setMethod(aliReq.method)
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).aliContext = aliContext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).aliReq = aliReq;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).aliRes = aliRes;

    const sfaRes = await this.invoke(ctx);

    aliRes.statusCode = sfaRes.status;
    Object.keys(sfaRes.headers)
      .filter((key) => !!sfaRes.headers[key])
      .forEach((key) => {
        aliRes.setHeader(key, sfaRes.headers[key] as string);
      });
    this.writeBody(sfaRes, aliRes);

    return;
  }

  private writeBody(sfaRes: SfaResponse, aliRes: AliRes) {
    if (!sfaRes.body) {
      aliRes.send("");
      return;
    }

    if (isPlainObject(sfaRes.body)) {
      aliRes.send(JSON.stringify(sfaRes.body));
    } else {
      aliRes.send(sfaRes.body);
    }
  }
}
