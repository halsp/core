import Koa from "koa";
import http from "http";
import net from "net";
import { Context, isPlainObject, Response } from "@ipare/core";
import { TransResponse } from "./trans-response";
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
  ipareCtx: Context
): Promise<Koa.ParameterizedContext> {
  const httpReq = await getHttpReq(ipareCtx);
  const httpRes = new TransResponse(httpReq);

  const koaCtx = koaApp.createContext(httpReq, httpRes);
  await ipareResToKoaRes(ipareCtx.res, koaCtx);
  return koaCtx;
}

async function getHttpReq(ipareCtx: Context): Promise<http.IncomingMessage> {
  let httpReq: http.IncomingMessage;
  if ("httpReq" in ipareCtx) {
    httpReq = ipareCtx["httpReq"];
  } else if ("aliReq" in ipareCtx) {
    httpReq = ipareCtx["aliReq"];
  } else {
    httpReq = new http.IncomingMessage(new net.Socket());
    const body = ipareCtx.req.body;
    if (Buffer.isBuffer(body)) {
      httpReq.push(body);
    } else if (typeof body == "string") {
      httpReq.push(body);
    } else if (isPlainObject(body)) {
      httpReq.push(JSON.stringify(body));
    } else {
      httpReq.push(body);
    }
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

  return httpReq;
}
