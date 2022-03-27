import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { isString } from "../shared";
import { HttpErrorMessage } from "./HttpErrorMessage";
import { SfaHeader } from "./SfaHeader";
import { SfaResponse } from "./SfaResponse";

export abstract class ResultHandler extends SfaHeader {
  constructor(resFinder: () => SfaResponse) {
    super(() => resFinder().headers);
    this.#resFinder = resFinder;
  }

  #resFinder;

  get #res(): SfaResponse {
    return this.#resFinder();
  }

  private setResult(status: StatusCodes, body?: unknown): this {
    if (body != undefined) {
      this.#res.body = body;
    }
    this.#res.status = status;
    return this;
  }

  private setError(
    status: StatusCodes,
    error?: HttpErrorMessage | string
  ): this {
    this.#res.status = status;

    const obj = {
      status: status,
      message: isString(error) ? error : getReasonPhrase(status),
    };
    if (error && !isString(error)) {
      this.#res.body = Object.assign(obj, error);
    } else {
      this.#res.body = obj;
    }
    return this;
  }

  ok(body?: unknown): this {
    return this.setResult(StatusCodes.OK, body);
  }

  created(location: string, body?: unknown): this {
    return this.setResult(StatusCodes.CREATED, body).setHeader(
      "location",
      location
    );
  }

  accepted(body?: unknown): this {
    return this.setResult(StatusCodes.ACCEPTED, body);
  }

  noContent(): this {
    return this.setResult(StatusCodes.NO_CONTENT);
  }

  partialContent(body?: unknown): this {
    return this.setResult(StatusCodes.PARTIAL_CONTENT, body);
  }

  badRequest(body?: unknown): this {
    return this.setResult(StatusCodes.BAD_REQUEST, body);
  }

  badRequestMsg(error?: HttpErrorMessage | string): this {
    return this.setError(StatusCodes.BAD_REQUEST, error);
  }

  unauthorized(body?: unknown): this {
    return this.setResult(StatusCodes.UNAUTHORIZED, body);
  }

  unauthorizedMsg(error?: HttpErrorMessage | string): this {
    return this.setError(StatusCodes.UNAUTHORIZED, error);
  }

  forbidden(body?: unknown): this {
    return this.setResult(StatusCodes.FORBIDDEN, body);
  }

  forbiddenMsg(error?: HttpErrorMessage | string): this {
    return this.setError(StatusCodes.FORBIDDEN, error);
  }

  notFound(body?: unknown): this {
    return this.setResult(StatusCodes.NOT_FOUND, body);
  }

  notFoundMsg(error?: HttpErrorMessage | string): this {
    return this.setError(StatusCodes.NOT_FOUND, error);
  }

  errRequest(body?: unknown): this {
    return this.setResult(StatusCodes.INTERNAL_SERVER_ERROR, body);
  }

  errRequestMsg(error?: HttpErrorMessage | string): this {
    return this.setError(StatusCodes.INTERNAL_SERVER_ERROR, error);
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
