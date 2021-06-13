import { ReasonPhrases, StatusCodes } from "http-status-codes";
import Response from "./Response";
import ErrorMessage from "./Response/ErrorMessage";

export default abstract class ResultHandler {
  private get response(): Response {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const that = this as any;
    if (that.ctx) return that.ctx.res;
    else return that.res;
  }

  ok(body?: unknown): Response {
    this.response.body = body;
    this.response.status = StatusCodes.OK;
    return this.response;
  }

  created(location: string, body?: unknown): Response {
    this.response.body = body;
    this.response.status = StatusCodes.CREATED;
    this.response.setHeader("location", location);
    return this.response;
  }

  accepted(body?: unknown): Response {
    this.response.body = body;
    this.response.status = StatusCodes.ACCEPTED;
    return this.response;
  }

  noContent(): Response {
    this.response.status = StatusCodes.NO_CONTENT;
    return this.response;
  }

  partialContent(body?: unknown): Response {
    this.response.body = body;
    this.response.status = StatusCodes.PARTIAL_CONTENT;
    return this.response;
  }

  badRequest(body?: unknown): Response {
    this.response.body = body;
    this.response.status = StatusCodes.BAD_REQUEST;
    return this.response;
  }

  badRequestMsg(msg?: ErrorMessage & Record<string, unknown>): Response {
    if (!msg) msg = { message: ReasonPhrases.BAD_REQUEST };
    return this.badRequest(msg);
  }

  unauthorized(body?: unknown): Response {
    this.response.body = body;
    this.response.status = StatusCodes.UNAUTHORIZED;
    return this.response;
  }

  unauthorizedMsg(msg?: ErrorMessage & Record<string, unknown>): Response {
    if (!msg) msg = { message: ReasonPhrases.UNAUTHORIZED };
    return this.unauthorized(msg);
  }

  forbidden(body?: unknown): Response {
    this.response.body = body;
    this.response.status = StatusCodes.FORBIDDEN;
    return this.response;
  }

  forbiddenMsg(msg?: ErrorMessage & Record<string, unknown>): Response {
    if (!msg) msg = { message: ReasonPhrases.FORBIDDEN };
    return this.forbidden(msg);
  }

  notFound(body?: unknown): Response {
    this.response.body = body;
    this.response.status = StatusCodes.NOT_FOUND;
    return this.response;
  }

  notFoundMsg(msg?: ErrorMessage & Record<string, unknown>): Response {
    if (!msg) msg = { message: ReasonPhrases.NOT_FOUND };
    return this.notFound(msg);
  }

  errRequest(body?: unknown): Response {
    this.response.body = body;
    this.response.status = StatusCodes.INTERNAL_SERVER_ERROR;
    return this.response;
  }

  errRequestMsg(msg?: ErrorMessage & Record<string, unknown>): Response {
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
  ): Response {
    this.response.status = code;
    this.response.setHeader("location", location);
    return this.response;
  }
}
