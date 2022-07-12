import { HttpContext, Response } from "@ipare/core";
import Koa from "koa";
import { UseKoaOptions } from "./use-koa-options";
import http from "http";
import { TransResponse } from "./trans-response";
import net from "net";
import queryString from "query-string";

export async function koaResToIpareRes(
  koaCtx: Koa.ParameterizedContext,
  ipareRes: Response
) {
  Object.keys(ipareRes.headers).forEach((key) => {
    ipareRes.removeHeader(key);
  });
  Object.keys(koaCtx.response.headers).forEach((key) => {
    const value = koaCtx.res.getHeader(key);
    if (value) {
      ipareRes.setHeader(key, value);
    }
  });

  ipareRes.body = koaCtx.body ?? undefined;
  ipareRes.status = koaCtx.status;
}

export async function ipareResToKoaRes(
  ipareRes: Response,
  koaCtx: Koa.ParameterizedContext
) {
  koaCtx.body = ipareRes.body ?? null;
  Object.keys(koaCtx.response.headers).forEach((key) => {
    koaCtx.remove(key);
  });
  for (const key in ipareRes.headers) {
    const value = ipareRes.getHeader(key);
    if (value) {
      koaCtx.set(key, value);
    }
  }
  koaCtx.status = ipareRes.status;
}

export async function createContext(
  koaApp: Koa,
  ipareCtx: HttpContext,
  options: UseKoaOptions
): Promise<Koa.ParameterizedContext> {
  const httpReq = await getHttpReq(ipareCtx, options);
  const httpRes = new TransResponse(httpReq);

  const koaCtx = koaApp.createContext(httpReq, httpRes);
  await ipareResToKoaRes(ipareCtx.res, koaCtx);
  return koaCtx;
}

async function getHttpReq(
  ipareCtx: HttpContext,
  options: UseKoaOptions
): Promise<http.IncomingMessage> {
  let httpReq: http.IncomingMessage;
  if (options.streamingBody) {
    httpReq = <http.IncomingMessage>options.streamingBody(ipareCtx);
  } else {
    httpReq = new http.IncomingMessage(new net.Socket());
  }
  httpReq.headers = Object.assign({}, ipareCtx.req.headers);
  httpReq.url =
    "/" +
    queryString.stringifyUrl({
      url: ipareCtx.req.path,
      query: ipareCtx.req.query,
    });
  httpReq.method = ipareCtx.req.method;
  httpReq.complete = true;
  httpReq.httpVersion = "1.1";
  httpReq.httpVersionMajor = 1;
  httpReq.httpVersionMinor = 1;

  if (!options.streamingBody) {
    const body = ipareCtx.req.body;
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
