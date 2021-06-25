import "sfa";
import { Startup, Response, HttpContext } from "sfa";
import * as Koa from "koa";
import * as http from "http";
import * as net from "net";
import * as queryString from "query-string";
import TransResponse from "./TransResponse";
import * as compose from "koa-compose";

interface SfaKoaOptions {
  streamingBody?: (ctx: HttpContext) => NodeJS.ReadableStream;
}

declare module "sfa" {
  interface Startup {
    useKoa<T extends this>(app: Koa, cfg?: SfaKoaOptions): T;
  }
}

// step: sfa -> koa -> sfa ->koa ->sfa
Startup.prototype.useKoa = function <T extends Startup>(
  app: Koa,
  cfg: SfaKoaOptions = {}
): T {
  app.use(async (ctx) => {
    await koaResToSfaRes(ctx, ctx.sfaCtx.res); // step 2. koa -> sfa
    await ctx.sfaNext();
    await sfaResToKoaRes(ctx.sfaCtx.res, ctx); // step 3. sfa-> koa
  });
  const fn = compose(app.middleware);
  if (!app.listenerCount("error")) app.on("error", app.onerror);

  this.use(async (ctx, next) => {
    const httpReq = await getHttpReq(ctx, cfg); // step 1. sfa-> koa
    const httpRes = new TransResponse(httpReq);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (httpRes as any).sfaRes = ctx.res;

    const koaCtx = app.createContext(httpReq, httpRes);
    koaCtx.sfaNext = next;
    koaCtx.sfaCtx = ctx;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (app as any).handleRequest(koaCtx, fn);
    await koaResToSfaRes(koaCtx, ctx.res); // step 4. koa -> sfa
  });
  return this as T;
};

async function koaResToSfaRes(
  kaoContext: Koa.ParameterizedContext,
  res: Response
) {
  const httpRes = kaoContext.res as TransResponse;
  const headers = httpRes.headers;
  Object.keys(res.headers).forEach((key) => {
    res.removeHeader(key);
  });
  Object.keys(headers).forEach((key) => {
    const value = headers[key];
    if (value) {
      res.setHeader(key, value);
    }
  });

  res.status = httpRes.statusCode;
  res.body = kaoContext.body ?? undefined;
}

async function sfaResToKoaRes(
  res: Response,
  kaoContext: Koa.ParameterizedContext
) {
  kaoContext.body = res.body ?? null;
  const httpRes = kaoContext.res as TransResponse;
  httpRes.statusCode = res.status;
  Object.keys(kaoContext.headers).forEach((key) => {
    httpRes.removeHeader(key);
  });
  for (const key in res.headers) {
    const value = res.headers[key];
    if (value) {
      httpRes.setHeader(key, value);
    }
  }
}

async function getHttpReq(
  ctx: HttpContext,
  cfg: SfaKoaOptions
): Promise<http.IncomingMessage> {
  let httpReq;
  if (cfg.streamingBody) {
    httpReq = <http.IncomingMessage>cfg.streamingBody(ctx);
  } else {
    httpReq = new http.IncomingMessage(new net.Socket());
  }
  httpReq.headers = ctx.req.headers;
  httpReq.url = queryString.stringifyUrl({
    url: ctx.req.path,
    query: ctx.req.params,
  });
  httpReq.method = ctx.req.method;
  httpReq.complete = true;
  httpReq.httpVersion = "1.1";
  httpReq.httpVersionMajor = 1;
  httpReq.httpVersionMinor = 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (httpReq as any).sfaReq = ctx.req;

  if (!cfg.streamingBody) {
    const body = ctx.req.body;
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

export { SfaKoaOptions, Koa };
