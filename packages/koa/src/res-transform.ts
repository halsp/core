import Koa from "koa";
import http from "http";
import net from "net";
import { Context, isPlainObject, Response } from "@halsp/core";
import { TransResponse } from "./trans-response";
import qs from "qs";

export async function koaResToHalspRes(
  koaCtx: Koa.ParameterizedContext,
  halspRes: Response,
) {
  Object.keys(halspRes.headers).forEach((key) => {
    halspRes.removeHeader(key);
  });
  Object.keys(koaCtx.response.headers).forEach((key) => {
    const value = koaCtx.res.getHeader(key);
    if (value) {
      halspRes.setHeader(key, value);
    }
  });

  halspRes.body = koaCtx.body ?? undefined;
  halspRes.status = koaCtx.status;
}

export async function halspResToKoaRes(
  halspRes: Response,
  koaCtx: Koa.ParameterizedContext,
) {
  koaCtx.body = halspRes.body ?? null;
  Object.keys(koaCtx.response.headers).forEach((key) => {
    koaCtx.remove(key);
  });
  for (const key in halspRes.headers) {
    const value = halspRes.getHeader(key);
    if (value) {
      koaCtx.set(key, value);
    }
  }
  koaCtx.status = halspRes.status;
}

export async function createContext(
  koaApp: Koa,
  halspCtx: Context,
): Promise<Koa.ParameterizedContext> {
  const reqStream = await getReqStream(halspCtx);
  const resStream = new TransResponse(reqStream);

  const koaCtx = koaApp.createContext(reqStream, resStream);
  await halspResToKoaRes(halspCtx.res, koaCtx);
  return koaCtx;
}

async function getReqStream(halspCtx: Context): Promise<http.IncomingMessage> {
  let reqStream: http.IncomingMessage;
  if (halspCtx["reqStream"]) {
    reqStream = halspCtx["reqStream"] as http.IncomingMessage;
  } else {
    reqStream = new http.IncomingMessage(new net.Socket());
    const body = halspCtx.req.body;
    if (Buffer.isBuffer(body)) {
      reqStream.push(body);
    } else if (typeof body == "string") {
      reqStream.push(body);
    } else if (isPlainObject(body)) {
      reqStream.push(JSON.stringify(body));
    } else {
      reqStream.push(body);
    }
  }

  reqStream.headers = Object.assign({}, halspCtx.req.headers);

  reqStream.url =
    "/" +
    halspCtx.req.path +
    qs.stringify(halspCtx.req.query, {
      addQueryPrefix: true,
    });
  reqStream.method = halspCtx.req.method;
  reqStream.complete = true;
  reqStream.httpVersion = "1.1";
  reqStream.httpVersionMajor = 1;
  reqStream.httpVersionMinor = 1;

  return reqStream;
}
