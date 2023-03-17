import { Stream } from "stream";
import * as mime from "mime-types";
import { isString, Startup } from "@halsp/common";
import { HttpContext, HttpRequest, HttpResponse } from "./context";

export abstract class HttpStartup extends Startup<
  HttpRequest,
  HttpResponse,
  HttpContext
> {
  constructor() {
    super();
    process.env.HALSP_ENV = "http";
  }

  protected async invoke(
    ctx: HttpRequest | HttpContext
  ): Promise<HttpResponse> {
    ctx = ctx instanceof HttpRequest ? new HttpContext(ctx) : ctx;

    await super.invoke(ctx);
    this.#setType(ctx.res);
    return ctx.res;
  }

  #setType(res: HttpResponse) {
    const body = res.body;

    if (!body) {
      res.remove("content-type");
      res.remove("content-length");
      return res;
    }

    const writeType = !res.has("content-type");
    const writeLength = !res.has("content-length");

    if (Buffer.isBuffer(body)) {
      if (writeLength) {
        res.set("content-length", body.byteLength);
      }
      if (writeType) {
        res.set("content-type", mime.contentType("bin") as string);
      }
    } else if (body instanceof Stream) {
      if (writeType) {
        res.set("content-type", mime.contentType("bin") as string);
      }
    } else if (isString(body)) {
      if (writeLength) {
        res.set("content-length", Buffer.byteLength(body));
      }
      if (writeType) {
        const type = /^\s*</.test(body) ? "html" : "text";
        res.set("content-type", mime.contentType(type) as string);
      }
    } else {
      if (writeLength) {
        res.set("content-length", Buffer.byteLength(JSON.stringify(body)));
      }
      if (writeType) {
        res.set("content-type", mime.contentType("json") as string);
      }
    }

    return res;
  }
}
