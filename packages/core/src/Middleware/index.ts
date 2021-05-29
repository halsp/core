import HttpContext from "../HttpContext";
import Response from "../Response";
import ErrorMessage from "../Response/ErrorMessage";
import StatusCode from "../Response/StatusCode";

export default abstract class Middleware {
  #index!: number;

  #ctx!: HttpContext;
  public get ctx(): HttpContext {
    return this.#ctx;
  }

  abstract invoke(): Promise<void>;
  protected async next(): Promise<void> {
    if (this.ctx.mds.length <= this.#index + 1) return;

    const { mdf, md } = this.ctx.mds[this.#index + 1];
    if (md) {
      await md.invoke();
    } else {
      if (!mdf) return;
      const nextMd = mdf();
      this.ctx.mds[this.#index].md = nextMd;
      nextMd.init(this.ctx, this.#index + 1);
      await nextMd.invoke();
    }
  }

  public init(ctx: HttpContext, index: number): void {
    this.#ctx = ctx;
    this.#index = index;
  }

  protected ok = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCode.ok;
    return this.ctx.res;
  };

  protected created = (location: string, body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCode.created;
    this.ctx.res.headers.location = location;
    return this.ctx.res;
  };

  protected accepted = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCode.accepted;
    return this.ctx.res;
  };

  protected noContent = (): Response => {
    this.ctx.res.status = StatusCode.noContent;
    return this.ctx.res;
  };

  protected partialContent = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCode.partialContent;
    return this.ctx.res;
  };

  protected badRequest = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCode.badRequest;
    return this.ctx.res;
  };

  protected badRequestMsg(
    msg?: ErrorMessage & Record<string, unknown>
  ): Response {
    if (!msg) {
      msg = {
        message: "Bad Request",
      };
    }

    return this.badRequest(msg);
  }

  protected unauthorized = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCode.unauthorized;
    return this.ctx.res;
  };

  protected unauthorizedMsg(
    msg?: ErrorMessage & Record<string, unknown>
  ): Response {
    if (!msg) {
      msg = {
        message: "Unauthorized",
      };
    }

    return this.unauthorized(msg);
  }

  protected forbidden = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCode.forbidden;
    return this.ctx.res;
  };

  protected forbiddenMsg(
    msg?: ErrorMessage & Record<string, unknown>
  ): Response {
    if (!msg) {
      msg = {
        message: "Forbidden",
      };
    }

    return this.forbidden(msg);
  }

  protected notFound = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCode.notFound;
    return this.ctx.res;
  };

  protected notFoundMsg(
    msg?: ErrorMessage & Record<string, unknown>
  ): Response {
    if (!msg) {
      msg = {
        message: "Not Found",
      };
    }

    return this.notFound(msg);
  }

  protected errRequest = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCode.errRequest;
    return this.ctx.res;
  };

  protected errRequestMsg(
    msg?: ErrorMessage & Record<string, unknown>
  ): Response {
    if (!msg) {
      msg = {
        message: "Error Request",
      };
    }

    return this.errRequest(msg);
  }

  protected redirect = (
    location: string,
    code:
      | StatusCode.redirect301
      | StatusCode.redirect302
      | StatusCode.redirect303
      | StatusCode.redirect307
      | StatusCode.redirect308
      | number = StatusCode.redirect302
  ): Response => {
    this.ctx.res.status = code;
    this.ctx.res.headers.location = location;
    return this.ctx.res;
  };
}
