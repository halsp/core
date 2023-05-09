import * as net from "net";
import * as http from "http";
import * as https from "https";
import {
  Response,
  Dict,
  isString,
  closeServer,
  logAddress,
  Startup,
  Context,
  dynamicListen,
} from "@halsp/core";
import type { NumericalHeadersDict } from "@halsp/http";
import "@halsp/http";
import qs from "qs";
import { Stream } from "stream";
import { Options } from "./options";
import { USED } from "./constant";

type ServerType = http.Server | https.Server;

declare module "@halsp/core" {
  interface Startup {
    useNative(options?: Options): this;
    get server(): ServerType;

    listen(
      port?: number,
      hostname?: string,
      backlog?: number,
      listeningListener?: () => void
    ): ServerType;
    listen(
      port?: number,
      hostname?: string,
      listeningListener?: () => void
    ): ServerType;
    listen(
      port?: number,
      backlog?: number,
      listeningListener?: () => void
    ): ServerType;
    listen(port?: number, listeningListener?: () => void): ServerType;
    listen(
      path: string,
      backlog?: number,
      listeningListener?: () => void
    ): ServerType;
    listen(path: string, listeningListener?: () => void): ServerType;
    listen(
      options: net.ListenOptions,
      listeningListener?: () => void
    ): ServerType;
    listen(
      handle: any,
      backlog?: number,
      listeningListener?: () => void
    ): ServerType;
    listen(handle: any, listeningListener?: () => void): ServerType;

    dynamicListen(
      port?: number,
      hostname?: string,
      backlog?: number,
      listeningListener?: () => void
    ): Promise<{ port: number; server: ServerType }>;
    dynamicListen(
      port?: number,
      hostname?: string,
      listeningListener?: () => void
    ): Promise<{ port: number; server: ServerType }>;
    dynamicListen(
      port?: number,
      backlog?: number,
      listeningListener?: () => void
    ): Promise<{ port: number; server: ServerType }>;

    close(): Promise<void>;
  }
}

Startup.prototype.useNative = function (options?: Options) {
  if (this[USED]) {
    return this;
  }
  this[USED] = true;

  const requestListener = async (
    reqStream: http.IncomingMessage,
    resStream: http.ServerResponse
  ): Promise<void> => {
    const ctx = new Context();

    Object.defineProperty(ctx, "resStream", {
      get: () => resStream,
    });
    Object.defineProperty(ctx, "reqStream", {
      get: () => reqStream,
    });

    const res = await this["invoke"](ctx);

    if (!resStream.writableEnded) {
      resStream.statusCode = res.status;
      writeHead(res, resStream);
      writeBody(res, resStream);
    }
  };

  let server: ServerType;
  if (!!options?.https) {
    server = https.createServer(options, requestListener);
  } else if (options) {
    server = http.createServer(options, requestListener);
  } else {
    server = http.createServer(requestListener);
  }
  Object.defineProperty(this, "server", {
    configurable: true,
    enumerable: true,
    get: () => server,
  });

  this.server.on("listening", () => {
    logAddress(this.server, this.logger, "http://localhost");
  });

  return this.useHttp().use(async (ctx, next) => {
    const pathname = (ctx.reqStream.url as string).split("?")[0];
    const query = qs.parse((ctx.reqStream.url as string).split("?")[1]);
    ctx.req
      .setPath(pathname)
      .setMethod(ctx.reqStream.method as string)
      .setQuery(query as Dict<string>)
      .setHeaders(ctx.reqStream.headers as NumericalHeadersDict);
    ctx.resStream.statusCode = 404;
    await next();
  });
};

Startup.prototype.listen = function (...args: any[]) {
  return this.server.listen(...args);
};

Startup.prototype.dynamicListen = async function (...args: any[]) {
  const port = await dynamicListen(this.server, ...args);
  return {
    port,
    server: this.server,
  };
};

Startup.prototype.close = async function () {
  await closeServer(this.server, this.logger);
};

function writeHead(halspRes: Response, resStream: http.ServerResponse) {
  if (resStream.headersSent) return;
  Object.keys(halspRes.headers)
    .filter((key) => !!halspRes.headers[key])
    .forEach((key) => {
      resStream.setHeader(key, halspRes.headers[key] as string | string[]);
    });
}

function writeBody(halspRes: Response, resStream: http.ServerResponse) {
  if (!halspRes.body) {
    resStream.end();
    return;
  }

  if (halspRes.body instanceof Stream) {
    halspRes.body.pipe(resStream);
  } else if (Buffer.isBuffer(halspRes.body)) {
    resStream.end(halspRes.body);
  } else if (isString(halspRes.body)) {
    resStream.end(halspRes.body);
  } else {
    resStream.end(JSON.stringify(halspRes.body));
  }
}
