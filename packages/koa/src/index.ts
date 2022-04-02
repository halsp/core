import "@sfajs/core";
import { Startup, SfaResponse, HttpContext } from "@sfajs/core";
import Koa from "koa";
import http from "http";
import net from "net";
import queryString from "query-string";
import TransResponse from "./TransResponse";
import compose from "koa-compose";

interface SfaKoaOptions {
  streamingBody?: (sfaCtx: HttpContext) => NodeJS.ReadableStream;
}

declare module "@sfajs/core" {
  interface Startup {
    useKoa<T extends this>(app: Koa, cfg?: SfaKoaOptions): T;
  }
}

// step: sfa -> koa -> sfa ->koa ->sfa
Startup.prototype.useKoa = function <T extends Startup>(
  app: Koa,
  cfg: SfaKoaOptions = {}
): T {
  app.middleware.splice(0, 0, async (koaCtx, next) => {
    koaCtx.status = koaCtx.sfaInStatus;
    await next();
  });
  const fn = compose(app.middleware);
  if (!app.listenerCount("error")) app.on("error", app.onerror);

  app.use(async (koaCtx) => {
    await koaResToSfaRes(koaCtx, koaCtx.sfaCtx.res); // step 2. koa -> sfa
    await koaCtx.sfaNext();
    await sfaResToKoaRes(koaCtx.sfaCtx.res, koaCtx); // step 3. sfa-> koa
  });

  this.use(async (sfaCtx, next) => {
    const koaCtx = await createContext(app, sfaCtx, cfg); // step 1. sfa-> koa
    koaCtx.sfaNext = next;
    koaCtx.sfaCtx = sfaCtx;

    koaCtx.sfaInStatus = koaCtx.status; // status will be set to 404 in 'handleRequest'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (app as any).handleRequest(koaCtx, fn);
    await koaResToSfaRes(koaCtx, sfaCtx.res); // step 4. koa -> sfa
  });
  return this as T;
};

async function koaResToSfaRes(
  koaCtx: Koa.ParameterizedContext,
  sfaRes: SfaResponse
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

async function sfaResToKoaRes(
  sfaRes: SfaResponse,
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

async function createContext(
  koaApp: Koa,
  sfaCtx: HttpContext,
  cfg: SfaKoaOptions
): Promise<Koa.ParameterizedContext> {
  const httpReq = await getHttpReq(sfaCtx, cfg);
  const httpRes = new TransResponse(httpReq);

  const koaCtx = koaApp.createContext(httpReq, httpRes);
  await sfaResToKoaRes(sfaCtx.res, koaCtx);
  return koaCtx;
}

async function getHttpReq(
  sfaCtx: HttpContext,
  cfg: SfaKoaOptions
): Promise<http.IncomingMessage> {
  let httpReq;
  if (cfg.streamingBody) {
    httpReq = <http.IncomingMessage>cfg.streamingBody(sfaCtx);
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

  if (!cfg.streamingBody) {
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

export { SfaKoaOptions, Koa };
