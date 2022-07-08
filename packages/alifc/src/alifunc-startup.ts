import { HttpContext, isString, Request, Response } from "@sfajs/core";
import { HttpBodyPraserStartup } from "@sfajs/http";
import { Stream } from "stream";
import { AliReq } from "./ali-req";
import { AliRes } from "./ali-res";

export class AlifuncStartup extends HttpBodyPraserStartup {
  constructor() {
    super((ctx) => ctx.aliReq);
  }

  async run(aliReq: AliReq, aliRes: AliRes, aliContext: any): Promise<void> {
    const ctx = new HttpContext(
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

    const sfaRes = await this.invoke(ctx);
    aliRes.statusCode = sfaRes.status;
    Object.keys(sfaRes.headers)
      .filter((key) => !!sfaRes.headers[key])
      .forEach((key) => {
        aliRes.setHeader(key, sfaRes.headers[key] as string);
      });
    await this.#writeBody(sfaRes, aliRes);
    return;
  }

  async #writeBody(sfaRes: Response, aliRes: AliRes) {
    if (!sfaRes.body) {
      aliRes.send("");
      return;
    }

    if (sfaRes.body instanceof Stream) {
      aliRes.send(await this.#streamToBuffer(sfaRes.body));
    } else if (Buffer.isBuffer(sfaRes.body)) {
      aliRes.send(sfaRes.body);
    } else if (isString(sfaRes.body)) {
      aliRes.send(sfaRes.body);
    } else {
      aliRes.send(JSON.stringify(sfaRes.body));
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
