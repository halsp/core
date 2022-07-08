import { HttpContext, Response } from "@sfajs/core";
import Koa from "koa";
import { UseKoaOptions } from "./use-koa-options";
import http from "http";
import { TransResponse } from "./trans-response";
import net from "net";
import queryString from "query-string";

export async function koaResToSfaRes(
  koaCtx: Koa.ParameterizedContext,
  sfaRes: Response
) {
  Object.keys(sfaRes.headers).forEach((key) => {
    sfaRes.removeHeader(key);
  });
  Object.keys(koaCtx.response.headers).forEach((key) => {
    const value = koaCtx.res.getHeader(key);
    if (value) {
      sfaRes.setHeader(key, value);
    }
  });

  sfaRes.body = koaCtx.body ?? undefined;
  sfaRes.status = koaCtx.status;
}

export async function sfaResToKoaRes(
  sfaRes: Response,
  koaCtx: Koa.ParameterizedContext
) {
  koaCtx.body = sfaRes.body ?? null;
  Object.keys(koaCtx.response.headers).forEach((key) => {
    koaCtx.remove(key);
  });
  for (const key in sfaRes.headers) {
    const value = sfaRes.getHeader(key);
    if (value) {
      koaCtx.set(key, value);
    }
  }
  koaCtx.status = sfaRes.status;
}

export async function createContext(
  koaApp: Koa,
  sfaCtx: HttpContext,
  options: UseKoaOptions
): Promise<Koa.ParameterizedContext> {
  const httpReq = await getHttpReq(sfaCtx, options);
  const httpRes = new TransResponse(httpReq);

  const koaCtx = koaApp.createContext(httpReq, httpRes);
  await sfaResToKoaRes(sfaCtx.res, koaCtx);
  return koaCtx;
}

async function getHttpReq(
  sfaCtx: HttpContext,
  options: UseKoaOptions
): Promise<http.IncomingMessage> {
  let httpReq: http.IncomingMessage;
  if (options.streamingBody) {
    httpReq = <http.IncomingMessage>options.streamingBody(sfaCtx);
  } else {
    httpReq = new http.IncomingMessage(new net.Socket());
  }
  httpReq.headers = Object.assign({}, sfaCtx.req.headers);
  httpReq.url =
    "/" +
    queryString.stringifyUrl({
      url: sfaCtx.req.path,
      query: sfaCtx.req.query,
    });
  httpReq.method = sfaCtx.req.method;
  httpReq.complete = true;
  httpReq.httpVersion = "1.1";
  httpReq.httpVersionMajor = 1;
  httpReq.httpVersionMinor = 1;

  if (!options.streamingBody) {
    const body = sfaCtx.req.body;
    if (Buffer.isBuffer(body)) {
      httpReq.push(body);
    } else if (typeof body == "string") {
      httpReq.push(Buffer.from(body));
    } else if (
      Object.prototype.toString.call(body).toLowerCase() == "[object object]" &&
      (!Object.getPrototypeOf(body) ||
        Object.getPrototypeOf(body) == Object.prototype)
    ) {
      httpReq.push(JSON.stringify(body));
    }
  }

  return httpReq;
}
