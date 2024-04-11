import "@halsp/http";
import "@halsp/body";

import { Context, isString, Response, Startup } from "@halsp/core";
import { Stream } from "stream";
import { AliReq } from "./ali-req";
import { AliRes } from "./ali-res";

declare module "@halsp/core" {
  interface Startup {
    useAlifc(): this;
    run(aliReq: AliReq, aliRes: AliRes, aliContext: any): Promise<void>;
  }
}

Startup.prototype.useAlifc = function () {
  return this.extend(
    "run",
    async (aliReq: AliReq, aliRes: AliRes, aliContext: any) => {
      const ctx = new Context();
      ctx.req
        .setPath(aliReq.path)
        .setHeaders(aliReq.headers)
        .setQuery(aliReq.queries)
        .setMethod(aliReq.method);

      Object.defineProperty(ctx, "aliContext", {
        configurable: true,
        enumerable: true,
        get: () => aliContext,
      });
      Object.defineProperty(ctx, "aliReq", {
        configurable: true,
        enumerable: true,
        get: () => aliReq,
      });
      Object.defineProperty(ctx, "reqStream", {
        configurable: true,
        enumerable: true,
        get: () => aliReq,
      });
      Object.defineProperty(ctx.req, "aliReq", {
        configurable: true,
        enumerable: true,
        get: () => aliReq,
      });
      Object.defineProperty(ctx, "aliRes", {
        configurable: true,
        enumerable: true,
        get: () => aliRes,
      });
      Object.defineProperty(ctx.res, "aliRes", {
        configurable: true,
        enumerable: true,
        get: () => aliRes,
      });

      await this["initialize"]();
      const halspRes = await this["invoke"](ctx);
      aliRes.statusCode = halspRes.status;
      Object.keys(halspRes.headers)
        .filter((key) => !!halspRes.headers[key])
        .forEach((key) => {
          aliRes.setHeader(key, halspRes.headers[key] as string);
        });
      await writeBody(halspRes, aliRes);
    },
  )
    .useHttp()
    .useHttpJsonBody();
};

async function writeBody(halspRes: Response, aliRes: AliRes) {
  if (!halspRes.body) {
    aliRes.send("");
    return;
  }

  if (halspRes.body instanceof Stream) {
    aliRes.send(await streamToBuffer(halspRes.body));
  } else if (Buffer.isBuffer(halspRes.body)) {
    aliRes.send(halspRes.body);
  } else if (isString(halspRes.body)) {
    aliRes.send(halspRes.body);
  } else {
    aliRes.send(JSON.stringify(halspRes.body));
  }
}

function streamToBuffer(stream: Stream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const buffers: any[] = [];
    stream.on("error", reject);
    stream.on("data", (data) => buffers.push(data));
    stream.on("end", () => resolve(Buffer.concat(buffers)));
  });
}
