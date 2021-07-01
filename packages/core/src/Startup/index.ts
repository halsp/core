import Response from "../Response";
import HttpContext from "../HttpContext";
import LambdaMiddleware from "../Middleware/LambdaMiddleware";
import Middleware from "../Middleware";
import { Stream } from "stream";
import * as mime from "mime-types";

export default abstract class Startup {
  #mds: ((ctx: HttpContext) => Middleware)[] = [];

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

  protected async invoke(ctx: HttpContext): Promise<Response> {
    if (!this.#mds.length) {
      return ctx.res;
    }

    const md = this.#mds[0](ctx);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (md as any).init(ctx, 0, this.#mds).invoke();

    return this.setType(ctx.res);
  }

  private setType(res: Response): Response {
    const writeType = !res.hasHeader("content-type");
    const writeLength = !res.hasHeader("content-length");

    const body = res.body;
    if (Buffer.isBuffer(body)) {
      if (writeLength) {
        res.setHeader("content-length", body.byteLength);
      }
      if (writeType) {
        res.setHeader("content-type", mime.contentType("bin") as string);
      }
    } else if (
      Object.prototype.toString.call(body).toLowerCase() == "[object object]" &&
      (!Object.getPrototypeOf(body) ||
        Object.getPrototypeOf(body) == Object.prototype)
    ) {
      if (writeLength) {
        res.setHeader(
          "content-length",
          Buffer.byteLength(JSON.stringify(body))
        );
      }
      if (writeType) {
        res.setHeader("content-type", mime.contentType("json") as string);
      }
    } else if (body instanceof Stream) {
      res.setHeader("Content-Type", mime.contentType("bin") as string);
    } else if (body) {
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
