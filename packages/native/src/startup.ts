import * as http from "http";
import * as https from "https";
import {
  Response,
  Dict,
  isString,
  logAddress,
  Startup,
  Context,
  getHalspPort,
  closeServer,
} from "@halsp/core";
import "@halsp/http";
import "@halsp/body";
import { NumericalHeadersDict } from "@halsp/http";
import qs from "qs";
import { Stream } from "stream";
import { NativeOptions } from "./options";

type ServerType = http.Server | https.Server;

declare module "@halsp/core" {
  interface Startup {
    useNative(options?: NativeOptions): this;

    listen(): Promise<ServerType>;
    close(): Promise<void>;
  }
}

const usedMap = new WeakMap<Startup, boolean>();
Startup.prototype.useNative = function (options?: NativeOptions) {
  if (usedMap.get(this)) return this;
  usedMap.set(this, true);

  initStartup.call(this, options);

  return this.useHttp().useHttpJsonBody();
};

async function requestListener(
  this: Startup,
  reqStream: http.IncomingMessage,
  resStream: http.ServerResponse,
): Promise<void> {
  const ctx = new Context();

  Object.defineProperty(ctx, "resStream", {
    get: () => resStream,
  });
  Object.defineProperty(ctx, "reqStream", {
    get: () => reqStream,
  });

  const pathname = (reqStream.url as string).split("?")[0];
  const query = qs.parse((reqStream.url as string).split("?")[1]);
  ctx.req
    .setPath(pathname)
    .setMethod(reqStream.method as string)
    .setQuery(query as Dict<string>)
    .setHeaders(reqStream.headers as NumericalHeadersDict);
  resStream.statusCode = 404;

  const res = await this["invoke"](ctx);

  if (!resStream.writableEnded) {
    resStream.statusCode = res.status;
    writeHead(res, resStream);
    writeBody(res, resStream);
  }
}

function initStartup(this: Startup, options?: NativeOptions) {
  const listener = requestListener.bind(this);
  let server: ServerType;
  if (!!options?.https) {
    server = https.createServer(options.https, listener);
  } else if (!!options) {
    server = http.createServer(options, listener);
  } else {
    server = http.createServer(listener);
  }
  Object.defineProperty(this, "nativeServer", {
    configurable: true,
    enumerable: true,
    get: () => server,
  });

  this.extend("listen", async () => {
    await closeServer(server);

    await new Promise<void>((resolve) => {
      server.listen(
        {
          ...options,
          port: getHalspPort(options?.port ?? 9504),
        },
        () => resolve(),
      );
    });
    return server;
  });

  this.extend("close", async () => {
    await closeServer(server);
    this.logger.info("Server shutdown success");
  });

  server.on("listening", () => {
    logAddress(server, this.logger, "http://localhost");
  });
}

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
