import Koa from "koa";
import http from "http";
import net from "net";
import { Context, isPlainObject, Response } from "@ipare/core";
import { TransResponse } from "./trans-response";
import qs from "qs";

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
  const reqStream = await getReqStream(ipareCtx);
  const resStream = new TransResponse(reqStream);

  const koaCtx = koaApp.createContext(reqStream, resStream);
  await ipareResToKoaRes(ipareCtx.res, koaCtx);
  return koaCtx;
}

async function getReqStream(ipareCtx: Context): Promise<http.IncomingMessage> {
  let reqStream: http.IncomingMessage;
  if (ipareCtx["reqStream"]) {
    reqStream = ipareCtx["reqStream"] as http.IncomingMessage;
  } else {
    reqStream = new http.IncomingMessage(new net.Socket());
    const body = ipareCtx.req.body;
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

  reqStream.headers = Object.assign({}, ipareCtx.req.headers);

  reqStream.url =
    "/" +
    ipareCtx.req.path +
    qs.stringify(ipareCtx.req.query, {
      addQueryPrefix: true,
    });
  reqStream.method = ipareCtx.req.method;
  reqStream.complete = true;
  reqStream.httpVersion = "1.1";
  reqStream.httpVersionMajor = 1;
  reqStream.httpVersionMinor = 1;

  return reqStream;
}
