import HttpContext from "../HttpContext";
import Response from "../Response";
import ErrorMessage from "../Response/ErrorMessage";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

export default abstract class Middleware {
  constructor(public readonly cache: boolean = true) {}

  #index!: number;

  #ctx!: HttpContext;
  public get ctx(): HttpContext {
    return this.#ctx;
  }

  abstract invoke(): Promise<void>;
  protected async next(): Promise<void> {
    if (this.ctx.mds.length <= this.#index + 1) return;
    const { builder, md } = this.ctx.mds[this.#index + 1];
    let nextMd;
    if (md && md.cache) {
      nextMd = md;
    } else {
      nextMd = builder();
    }
    this.ctx.mds[this.#index + 1].md = nextMd;
    nextMd.init(this.ctx, this.#index + 1);
    await nextMd.invoke();
  }

  private init(ctx: HttpContext, index: number): Middleware {
    this.#ctx = ctx;
    this.#index = index;
    return this;
  }

  protected ok = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCodes.OK;
    return this.ctx.res;
  };

  protected created = (location: string, body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCodes.CREATED;
    this.ctx.res.headers.location = location;
    return this.ctx.res;
  };

  protected accepted = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCodes.ACCEPTED;
    return this.ctx.res;
  };

  protected noContent = (): Response => {
    this.ctx.res.status = StatusCodes.NO_CONTENT;
    return this.ctx.res;
  };

  protected partialContent = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCodes.PARTIAL_CONTENT;
    return this.ctx.res;
  };

  protected badRequest = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCodes.BAD_REQUEST;
    return this.ctx.res;
  };

  protected badRequestMsg(
    msg?: ErrorMessage & Record<string, unknown>
  ): Response {
    if (!msg) msg = { message: ReasonPhrases.BAD_REQUEST };
    return this.badRequest(msg);
  }

  protected unauthorized = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCodes.UNAUTHORIZED;
    return this.ctx.res;
  };

  protected unauthorizedMsg(
    msg?: ErrorMessage & Record<string, unknown>
  ): Response {
    if (!msg) msg = { message: ReasonPhrases.UNAUTHORIZED };
    return this.unauthorized(msg);
  }

  protected forbidden = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCodes.FORBIDDEN;
    return this.ctx.res;
  };

  protected forbiddenMsg(
    msg?: ErrorMessage & Record<string, unknown>
  ): Response {
    if (!msg) msg = { message: ReasonPhrases.FORBIDDEN };
    return this.forbidden(msg);
  }

  protected notFound = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCodes.NOT_FOUND;
    return this.ctx.res;
  };

  protected notFoundMsg(
    msg?: ErrorMessage & Record<string, unknown>
  ): Response {
    if (!msg) msg = { message: ReasonPhrases.NOT_FOUND };
    return this.notFound(msg);
  }

  protected errRequest = (body?: unknown): Response => {
    this.ctx.res.body = body;
    this.ctx.res.status = StatusCodes.INTERNAL_SERVER_ERROR;
    return this.ctx.res;
  };

  protected errRequestMsg(
    msg?: ErrorMessage & Record<string, unknown>
  ): Response {
    if (!msg) msg = { message: ReasonPhrases.INTERNAL_SERVER_ERROR };
    return this.errRequest(msg);
  }

  protected redirect = (
    location: string,
    code:
      | StatusCodes.MOVED_PERMANENTLY
      | StatusCodes.MOVED_TEMPORARILY
      | StatusCodes.SEE_OTHER
      | StatusCodes.TEMPORARY_REDIRECT
      | StatusCodes.PERMANENT_REDIRECT = StatusCodes.MOVED_TEMPORARILY
  ): Response => {
    this.ctx.res.status = code;
    this.ctx.res.headers.location = location;
    return this.ctx.res;
  };
}
