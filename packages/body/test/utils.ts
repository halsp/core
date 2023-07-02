import "../src";
import * as http from "http";
import { Context, Dict, HookType, Startup } from "@halsp/core";
import { NumericalHeadersDict } from "@halsp/http";
import qs from "qs";

declare module "@halsp/core" {
  interface Context {
    get reqStream(): http.IncomingMessage;
    get resStream(): http.ServerResponse;
  }
  interface Startup {
    keepThrow(): this;
    listenTest(): http.Server;
  }
}

Startup.prototype.keepThrow = function (this: Startup) {
  return this.hook(HookType.Unhandled, (ctx, md, err) => {
    ctx.set("UnhandledError", err);
  });
};

Startup.prototype.listenTest = function () {
  const server = http.createServer(requestListener.bind(this));
  return server.listen.bind(server)();
};

async function requestListener(
  this: Startup,
  reqStream: http.IncomingMessage,
  resStream: http.ServerResponse
): Promise<void> {
  const pathname = (reqStream.url as string).split("?")[0];
  const query = qs.parse((reqStream.url as string).split("?")[1] ?? "");
  const ctx = new Context();
  ctx.req
    .setPath(pathname)
    .setMethod(reqStream.method as string)
    .setQuery(query as Dict<string>)
    .setHeaders(reqStream.headers as NumericalHeadersDict);

  Object.defineProperty(ctx, "resStream", {
    get: () => resStream,
  });
  Object.defineProperty(ctx, "reqStream", {
    get: () => reqStream,
  });

  await this.invoke(ctx);
  resStream.statusCode = ctx.res.status;
  resStream.end();

  if (ctx.get("UnhandledError")) {
    throw ctx.get("UnhandledError");
  }
}
