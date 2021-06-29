import { ReasonPhrases, StatusCodes } from "http-status-codes";
import HeadersHandler, { HeaderValueType } from "./HeadersHandler";
import Response from "./Response";
import ErrorMessage from "./Response/ErrorMessage";

export default abstract class ResultHandler extends HeadersHandler {
  constructor(
    private resFinder: () => Response,
    headersFinder?: () => NodeJS.Dict<HeaderValueType>
  ) {
    super(headersFinder ?? (() => resFinder().headers));
  }

  private get response(): Response {
    return this.resFinder();
  }

  ok(body?: unknown): Response {
    if (body != undefined) {
      this.response.body = body;
    }
    this.response.status = StatusCodes.OK;
    return this.response;
  }

  created(location: string, body?: unknown): Response {
    if (body != undefined) {
      this.response.body = body;
    }
    this.response.status = StatusCodes.CREATED;
    this.response.setHeader("location", location);
    return this.response;
  }

  accepted(body?: unknown): Response {
    if (body != undefined) {
      this.response.body = body;
    }
    this.response.status = StatusCodes.ACCEPTED;
    return this.response;
  }

  noContent(): Response {
    this.response.status = StatusCodes.NO_CONTENT;
    return this.response;
  }

  partialContent(body?: unknown): Response {
    if (body != undefined) {
      this.response.body = body;
    }
    this.response.status = StatusCodes.PARTIAL_CONTENT;
    return this.response;
  }

  badRequest(body?: unknown): Response {
    if (body != undefined) {
      this.response.body = body;
    }
    this.response.status = StatusCodes.BAD_REQUEST;
    return this.response;
  }

  badRequestMsg(msg?: ErrorMessage & NodeJS.Dict<unknown>): Response {
    if (!msg) msg = { message: ReasonPhrases.BAD_REQUEST };
    return this.badRequest(msg);
  }

  unauthorized(body?: unknown): Response {
    if (body != undefined) {
      this.response.body = body;
    }
    this.response.status = StatusCodes.UNAUTHORIZED;
    return this.response;
  }

  unauthorizedMsg(msg?: ErrorMessage & NodeJS.Dict<unknown>): Response {
    if (!msg) msg = { message: ReasonPhrases.UNAUTHORIZED };
    return this.unauthorized(msg);
  }

  forbidden(body?: unknown): Response {
    if (body != undefined) {
      this.response.body = body;
    }
    this.response.status = StatusCodes.FORBIDDEN;
    return this.response;
  }

  forbiddenMsg(msg?: ErrorMessage & NodeJS.Dict<unknown>): Response {
    if (!msg) msg = { message: ReasonPhrases.FORBIDDEN };
    return this.forbidden(msg);
  }

  notFound(body?: unknown): Response {
    if (body != undefined) {
      this.response.body = body;
    }
    this.response.status = StatusCodes.NOT_FOUND;
    return this.response;
  }

  notFoundMsg(msg?: ErrorMessage & NodeJS.Dict<unknown>): Response {
    if (!msg) msg = { message: ReasonPhrases.NOT_FOUND };
    return this.notFound(msg);
  }

  errRequest(body?: unknown): Response {
    if (body != undefined) {
      this.response.body = body;
    }
    this.response.status = StatusCodes.INTERNAL_SERVER_ERROR;
    return this.response;
  }

  errRequestMsg(msg?: ErrorMessage & NodeJS.Dict<unknown>): Response {
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
