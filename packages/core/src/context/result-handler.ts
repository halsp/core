import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { isString } from "../utils";
import { HttpErrorMessage } from "./http-error-message";
import { SfaHeader } from "./sfa-header";
import { Response } from "./response";

export abstract class ResultHandler extends SfaHeader {
  constructor(resFinder: () => Response) {
    super(() => resFinder().headers);
    this.#resFinder = resFinder;
  }

  readonly #resFinder: () => Response;

  get #res(): Response {
    return this.#resFinder();
  }

  #setResult(status: StatusCodes, body?: unknown): this {
    if (body != undefined) {
      this.#res.body = body;
    }
    this.#res.status = status;
    return this;
  }

  #setError(status: StatusCodes, error?: HttpErrorMessage | string): this {
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

  // 200
  ok = (body?: unknown): this => this.#setResult(StatusCodes.OK, body);

  // 201
  created = (location: string, body?: unknown): this =>
    this.#setResult(StatusCodes.CREATED, body).setHeader("location", location);

  // 202
  accepted = (body?: unknown): this =>
    this.#setResult(StatusCodes.ACCEPTED, body);

  // 204
  noContent = (): this => this.#setResult(StatusCodes.NO_CONTENT);

  // 206
  partialContent = (body?: unknown): this =>
    this.#setResult(StatusCodes.PARTIAL_CONTENT, body);

  // 30x
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

  // 400
  badRequest = (body?: unknown): this =>
    this.#setResult(StatusCodes.BAD_REQUEST, body);
  badRequestMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.BAD_REQUEST, error);

  // 401
  unauthorized = (body?: unknown): this =>
    this.#setResult(StatusCodes.UNAUTHORIZED, body);
  unauthorizedMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.UNAUTHORIZED, error);

  // 403
  forbidden = (body?: unknown): this =>
    this.#setResult(StatusCodes.FORBIDDEN, body);
  forbiddenMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.FORBIDDEN, error);

  // 404
  notFound = (body?: unknown): this =>
    this.#setResult(StatusCodes.NOT_FOUND, body);
  notFoundMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.NOT_FOUND, error);

  // 405
  methodNotAllowed = (body?: unknown): this =>
    this.#setResult(StatusCodes.METHOD_NOT_ALLOWED, body);
  methodNotAllowedMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.METHOD_NOT_ALLOWED, error);

  // 406
  notAcceptable = (body?: unknown): this =>
    this.#setResult(StatusCodes.NOT_ACCEPTABLE, body);
  notAcceptableMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.NOT_ACCEPTABLE, error);

  // 408
  requestTimeout = (body?: unknown): this =>
    this.#setResult(StatusCodes.REQUEST_TIMEOUT, body);
  requestTimeoutMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.REQUEST_TIMEOUT, error);

  // 409
  conflict = (body?: unknown): this =>
    this.#setResult(StatusCodes.CONFLICT, body);
  conflictMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.CONFLICT, error);

  // 410
  gone = (body?: unknown): this => this.#setResult(StatusCodes.GONE, body);
  goneMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.GONE, error);

  // 412
  preconditionFailed = (body?: unknown): this =>
    this.#setResult(StatusCodes.PRECONDITION_FAILED, body);
  preconditionFailedMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.PRECONDITION_FAILED, error);

  // 413
  requestTooLong = (body?: unknown): this =>
    this.#setResult(StatusCodes.REQUEST_TOO_LONG, body);
  requestTooLongMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.REQUEST_TOO_LONG, error);

  // 415
  unsupportedMediaType = (body?: unknown): this =>
    this.#setResult(StatusCodes.UNSUPPORTED_MEDIA_TYPE, body);
  unsupportedMediaTypeMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.UNSUPPORTED_MEDIA_TYPE, error);

  // 418
  imATeapot = (body?: unknown): this =>
    this.#setResult(StatusCodes.IM_A_TEAPOT, body);
  imATeapotMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.IM_A_TEAPOT, error);

  // 421
  misdirected = (body?: unknown): this =>
    this.#setResult(StatusCodes.MISDIRECTED_REQUEST, body);
  misdirectedMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.MISDIRECTED_REQUEST, error);

  // 422
  unprocessableEntity = (body?: unknown): this =>
    this.#setResult(StatusCodes.UNPROCESSABLE_ENTITY, body);
  unprocessableEntityMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.UNPROCESSABLE_ENTITY, error);

  // 500
  internalServerError = (body?: unknown): this =>
    this.#setResult(StatusCodes.INTERNAL_SERVER_ERROR, body);
  internalServerErrorMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.INTERNAL_SERVER_ERROR, error);

  // 501
  notImplemented = (body?: unknown): this =>
    this.#setResult(StatusCodes.NOT_IMPLEMENTED, body);
  notImplementedMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.NOT_IMPLEMENTED, error);

  // 502
  badGateway = (body?: unknown): this =>
    this.#setResult(StatusCodes.BAD_GATEWAY, body);
  badGatewayMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.BAD_GATEWAY, error);

  // 503
  serviceUnavailable = (body?: unknown): this =>
    this.#setResult(StatusCodes.SERVICE_UNAVAILABLE, body);
  serviceUnavailableMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.SERVICE_UNAVAILABLE, error);

  // 504
  gatewayTimeout = (body?: unknown): this =>
    this.#setResult(StatusCodes.GATEWAY_TIMEOUT, body);
  gatewayTimeoutMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.GATEWAY_TIMEOUT, error);

  // 505
  httpVersionNotSupported = (body?: unknown): this =>
    this.#setResult(StatusCodes.HTTP_VERSION_NOT_SUPPORTED, body);
  httpVersionNotSupportedMsg = (error?: HttpErrorMessage | string): this =>
    this.#setError(StatusCodes.HTTP_VERSION_NOT_SUPPORTED, error);
}
