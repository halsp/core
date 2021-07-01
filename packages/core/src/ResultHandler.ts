import { ReasonPhrases, StatusCodes } from "./utils";
import HeadersHandler from "./HeadersHandler";
import Response from "./Response";
import ErrorMessage from "./Response/ErrorMessage";

export default abstract class ResultHandler extends HeadersHandler {
  constructor(resFinder: () => Response) {
    super(() => resFinder().headers);
    this.#resFinder = resFinder;
  }

  #resFinder;

  get #res(): Response {
    return this.#resFinder();
  }

  ok(body?: unknown): this {
    if (body != undefined) {
      this.#res.body = body;
    }
    this.#res.status = StatusCodes.OK;
    return this;
  }

  created(location: string, body?: unknown): this {
    if (body != undefined) {
      this.#res.body = body;
    }
    this.#res.setStatus(StatusCodes.CREATED).setHeader("location", location);
    return this;
  }

  accepted(body?: unknown): this {
    if (body != undefined) {
      this.#res.body = body;
    }
    this.#res.status = StatusCodes.ACCEPTED;
    return this;
  }

  noContent(): this {
    this.#res.status = StatusCodes.NO_CONTENT;
    return this;
  }

  partialContent(body?: unknown): this {
    if (body != undefined) {
      this.#res.body = body;
    }
    this.#res.status = StatusCodes.PARTIAL_CONTENT;
    return this;
  }

  badRequest(body?: unknown): this {
    if (body != undefined) {
      this.#res.body = body;
    }
    this.#res.status = StatusCodes.BAD_REQUEST;
    return this;
  }

  badRequestMsg(msg?: ErrorMessage & NodeJS.Dict<unknown>): this {
    if (!msg) msg = { message: ReasonPhrases.BAD_REQUEST };
    return this.badRequest(msg);
  }

  unauthorized(body?: unknown): this {
    if (body != undefined) {
      this.#res.body = body;
    }
    this.#res.status = StatusCodes.UNAUTHORIZED;
    return this;
  }

  unauthorizedMsg(msg?: ErrorMessage & NodeJS.Dict<unknown>): this {
    if (!msg) msg = { message: ReasonPhrases.UNAUTHORIZED };
    return this.unauthorized(msg);
  }

  forbidden(body?: unknown): this {
    if (body != undefined) {
      this.#res.body = body;
    }
    this.#res.status = StatusCodes.FORBIDDEN;
    return this;
  }

  forbiddenMsg(msg?: ErrorMessage & NodeJS.Dict<unknown>): this {
    if (!msg) msg = { message: ReasonPhrases.FORBIDDEN };
    return this.forbidden(msg);
  }

  notFound(body?: unknown): this {
    if (body != undefined) {
      this.#res.body = body;
    }
    this.#res.status = StatusCodes.NOT_FOUND;
    return this;
  }

  notFoundMsg(msg?: ErrorMessage & NodeJS.Dict<unknown>): this {
    if (!msg) msg = { message: ReasonPhrases.NOT_FOUND };
    return this.notFound(msg);
  }

  errRequest(body?: unknown): this {
    if (body != undefined) {
      this.#res.body = body;
    }
    this.#res.status = StatusCodes.INTERNAL_SERVER_ERROR;
    return this;
  }

  errRequestMsg(msg?: ErrorMessage & NodeJS.Dict<unknown>): this {
    if (!msg) msg = { message: ReasonPhrases.INTERNAL_SERVER_ERROR };
    return this.errRequest(msg);
  }

  redirect(
    location: string,
    code:
      | StatusCodes.MOVED_PERMANENTLY
      | StatusCodes.MOVED_TEMPORARILY
      | StatusCodes.SEE_OTHER
      | StatusCodes.TEMPORARY_REDIRECT
      | StatusCodes.PERMANENT_REDIRECT = StatusCodes.MOVED_TEMPORARILY
  ): this {
    this.#res.setStatus(code).setHeader("location", location);
    return this;
  }
}
