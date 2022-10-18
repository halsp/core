import { Context, isString, Request, Response } from "@ipare/core";
import { BodyPraserStartup } from "@ipare/server";
import { Stream } from "stream";
import { AliReq } from "./ali-req";
import { AliRes } from "./ali-res";

export class AlifcStartup extends BodyPraserStartup {
  constructor() {
    super((ctx) => ctx.aliReq);
  }

  async run(aliReq: AliReq, aliRes: AliRes, aliContext: any): Promise<void> {
    const ctx = new Context(
      new Request()
        .setPath(aliReq.path)
        .setHeaders(aliReq.headers)
        .setQuery(aliReq.queries)
        .setMethod(aliReq.method)
    );

    Object.defineProperty(ctx, "aliContext", {
      configurable: false,
      enumerable: false,
      get: () => aliContext,
    });
    Object.defineProperty(ctx, "aliReq", {
      configurable: false,
      enumerable: false,
      get: () => aliReq,
    });
    Object.defineProperty(ctx.req, "aliReq", {
      configurable: false,
      enumerable: false,
      get: () => aliReq,
    });
    Object.defineProperty(ctx, "aliRes", {
      configurable: false,
      enumerable: false,
      get: () => aliRes,
    });
    Object.defineProperty(ctx.res, "aliRes", {
      configurable: false,
      enumerable: false,
      get: () => aliRes,
    });

    const ipareRes = await this.invoke(ctx);
    aliRes.statusCode = ipareRes.status;
    Object.keys(ipareRes.headers)
      .filter((key) => !!ipareRes.headers[key])
      .forEach((key) => {
        aliRes.setHeader(key, ipareRes.headers[key] as string);
      });
    await this.#writeBody(ipareRes, aliRes);
    return;
  }

  async #writeBody(ipareRes: Response, aliRes: AliRes) {
    if (!ipareRes.body) {
      aliRes.send("");
      return;
    }

    if (ipareRes.body instanceof Stream) {
      aliRes.send(await this.#streamToBuffer(ipareRes.body));
    } else if (Buffer.isBuffer(ipareRes.body)) {
      aliRes.send(ipareRes.body);
    } else if (isString(ipareRes.body)) {
      aliRes.send(ipareRes.body);
    } else {
      aliRes.send(JSON.stringify(ipareRes.body));
    }
  }

  #streamToBuffer(stream: Stream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const buffers: any[] = [];
      stream.on("error", reject);
      stream.on("data", (data) => buffers.push(data));
      stream.on("end", () => resolve(Buffer.concat(buffers)));
    });
  }
}
