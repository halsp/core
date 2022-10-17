import { Stream } from "stream";
import * as mime from "mime-types";
import { Context, isString, Request, Response, Startup } from "@ipare/core";
import { initCatchError } from "./context";

export abstract class HttpStartup extends Startup {
  constructor() {
    super();
    process.env.IS_IPARE_MICRO = "true";
  }

  protected async invoke(ctx: Context | Request): Promise<Response> {
    ctx = ctx instanceof Request ? new Context(ctx) : ctx;
    initCatchError(ctx);

    const res = await super.invoke(ctx);
    this.#setType(res);
    return res;
  }

  #setType(res: Response) {
    const body = res.body;

    if (!body) {
      res.removeHeader("content-type");
      res.removeHeader("content-length");
      return res;
    }

    const writeType = !res.hasHeader("content-type");
    const writeLength = !res.hasHeader("content-length");

    if (Buffer.isBuffer(body)) {
      if (writeLength) {
        res.setHeader("content-length", body.byteLength);
      }
      if (writeType) {
        res.setHeader("content-type", mime.contentType("bin") as string);
      }
    } else if (body instanceof Stream) {
      if (writeType) {
        res.setHeader("content-type", mime.contentType("bin") as string);
      }
    } else if (isString(body)) {
      if (writeLength) {
        res.setHeader("content-length", Buffer.byteLength(body));
      }
      if (writeType) {
        const type = /^\s*</.test(body) ? "html" : "text";
        res.setHeader("content-type", mime.contentType(type) as string);
      }
    } else {
      if (writeLength) {
        res.setHeader(
          "content-length",
          Buffer.byteLength(JSON.stringify(body))
        );
      }
      if (writeType) {
        res.setHeader("content-type", mime.contentType("json") as string);
      }
    }

    return res;
  }
}
