import { SfaResponse } from "../context/SfaResponse";
import { HttpContext } from "../context/HttpContext";
import { Middleware } from "../middlewares/Middleware";
import { Stream } from "stream";
import * as mime from "mime-types";
import { LambdaMiddleware } from "../middlewares/LambdaMiddleware";
import { isPlainObject } from "../shared";

export abstract class Startup {
  readonly #mds: ((ctx: HttpContext) => Middleware)[] = [];

  use(
    builder: (ctx: HttpContext, next: () => Promise<void>) => Promise<void>
  ): this {
    this.#mds.push(() => new LambdaMiddleware(builder));
    return this;
  }

  add(md: ((ctx: HttpContext) => Middleware) | Middleware): this {
    if (md instanceof Middleware) {
      this.#mds.push(() => md);
    } else {
      this.#mds.push(md);
    }
    return this;
  }

  protected async invoke(ctx: HttpContext): Promise<SfaResponse> {
    if (!this.#mds.length) {
      return ctx.res;
    }

    const md = this.#mds[0](ctx);
    try {
      await (md as any).init(ctx, 0, this.#mds).invoke();
    } catch (err) {
      ctx.catchError(err);
    }

    return this.setType(ctx.res);
  }

  private setType(res: SfaResponse): SfaResponse {
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
      res.setHeader("Content-Type", mime.contentType("bin") as string);
    } else if (isPlainObject(body)) {
      if (writeLength) {
        res.setHeader(
          "content-length",
          Buffer.byteLength(JSON.stringify(body))
        );
      }
      if (writeType) {
        res.setHeader("content-type", mime.contentType("json") as string);
      }
    } else {
      const strBody = String(body);
      if (writeLength) {
        res.setHeader("content-length", Buffer.byteLength(strBody));
      }
      if (writeType) {
        const type = /^\s*</.test(strBody) ? "html" : "text";
        res.setHeader("content-type", mime.contentType(type) as string);
      }
    }

    return res;
  }
}
