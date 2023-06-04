import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { HttpErrorMessage } from "./http-error-message";
import { isString, Response } from "@halsp/core";

export interface ResultHandler {
  // 200
  ok: (body?: unknown) => this;
  // 201
  created: (location: string, body?: unknown) => this;
  // 202
  accepted: (body?: unknown) => this;
  // 204
  noContent: () => this;
  // 206
  partialContent: (body?: unknown) => this;

  // 30x
  redirect: (
    location: string,
    code?:
      | StatusCodes.MOVED_PERMANENTLY
      | StatusCodes.MOVED_TEMPORARILY
      | StatusCodes.SEE_OTHER
      | StatusCodes.TEMPORARY_REDIRECT
      | StatusCodes.PERMANENT_REDIRECT
  ) => this;

  // 400
  badRequest: (body?: unknown) => this;
  badRequestMsg: (error?: HttpErrorMessage | string) => this;

  // 401
  unauthorized: (body?: unknown) => this;
  unauthorizedMsg: (error?: HttpErrorMessage | string) => this;

  // 403
  forbidden: (body?: unknown) => this;
  forbiddenMsg: (error?: HttpErrorMessage | string) => this;

  // 404
  notFound: (body?: unknown) => this;
  notFoundMsg: (error?: HttpErrorMessage | string) => this;

  // 405
  methodNotAllowed: (body?: unknown) => this;
  methodNotAllowedMsg: (error?: HttpErrorMessage | string) => this;

  // 406
  notAcceptable: (body?: unknown) => this;
  notAcceptableMsg: (error?: HttpErrorMessage | string) => this;

  // 408
  requestTimeout: (body?: unknown) => this;
  requestTimeoutMsg: (error?: HttpErrorMessage | string) => this;

  // 409
  conflict: (body?: unknown) => this;
  conflictMsg: (error?: HttpErrorMessage | string) => this;

  // 410
  gone: (body?: unknown) => this;
  goneMsg: (error?: HttpErrorMessage | string) => this;

  // 412
  preconditionFailed: (body?: unknown) => this;
  preconditionFailedMsg: (error?: HttpErrorMessage | string) => this;

  // 413
  requestTooLong: (body?: unknown) => this;
  requestTooLongMsg: (error?: HttpErrorMessage | string) => this;

  // 415
  unsupportedMediaType: (body?: unknown) => this;
  unsupportedMediaTypeMsg: (error?: HttpErrorMessage | string) => this;

  // 418
  imATeapot: (body?: unknown) => this;
  imATeapotMsg: (error?: HttpErrorMessage | string) => this;

  // 421
  misdirected: (body?: unknown) => this;
  misdirectedMsg: (error?: HttpErrorMessage | string) => this;

  // 422
  unprocessableEntity: (body?: unknown) => this;
  unprocessableEntityMsg: (error?: HttpErrorMessage | string) => this;

  // 500
  internalServerError: (body?: unknown) => this;
  internalServerErrorMsg: (error?: HttpErrorMessage | string) => this;

  // 501
  notImplemented: (body?: unknown) => this;
  notImplementedMsg: (error?: HttpErrorMessage | string) => this;

  // 502
  badGateway: (body?: unknown) => this;
  badGatewayMsg: (error?: HttpErrorMessage | string) => this;

  // 503
  serviceUnavailable: (body?: unknown) => this;
  serviceUnavailableMsg: (error?: HttpErrorMessage | string) => this;

  // 504
  gatewayTimeout: (body?: unknown) => this;
  gatewayTimeoutMsg: (error?: HttpErrorMessage | string) => this;

  // 505
  httpVersionNotSupported: (body?: unknown) => this;
  httpVersionNotSupportedMsg: (error?: HttpErrorMessage | string) => this;
}

export function initResultHandler<T extends ResultHandler>(
  target: T,
  getRes: (this: any) => Response
) {
  function setResult(this: any, status: StatusCodes, body?: unknown): T {
    const res = getRes.bind(this)();
    res.body = body;
    res.status = status;
    return this;
  }

  function setError(
    this: any,
    status: StatusCodes,
    error?: HttpErrorMessage | string
  ): T {
    const res = getRes.bind(this)();
    res.status = status;

    const obj = {
      status: status,
      message: isString(error) ? error : getReasonPhrase(status),
    };
    if (error && !isString(error)) {
      res.body = Object.assign(obj, error);
    } else {
      res.body = obj;
    }
    return this;
  }

  target.ok = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.OK, body);
  };

  target.created = function (location: string, body?: unknown): T {
    setResult.bind(this)(StatusCodes.CREATED, body);
    const res = getRes.bind(this)();
    res.set("location", location);
    return this;
  };

  target.accepted = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.ACCEPTED, body);
  };

  target.noContent = function (): T {
    return setResult.bind(this)(StatusCodes.NO_CONTENT);
  };

  target.partialContent = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.PARTIAL_CONTENT, body);
  };

  target.redirect = function (
    location: string,
    code:
      | StatusCodes.MOVED_PERMANENTLY
      | StatusCodes.MOVED_TEMPORARILY
      | StatusCodes.SEE_OTHER
      | StatusCodes.TEMPORARY_REDIRECT
      | StatusCodes.PERMANENT_REDIRECT = StatusCodes.MOVED_TEMPORARILY
  ): T {
    const res = getRes.bind(this)();
    res.setStatus(code).set("location", location);
    return this;
  };

  target.badRequest = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.BAD_REQUEST, body);
  };
  target.badRequestMsg = function (error?: HttpErrorMessage | string): T {
    return setError.bind(this)(StatusCodes.BAD_REQUEST, error);
  };

  target.unauthorized = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.UNAUTHORIZED, body);
  };
  target.unauthorizedMsg = function (error?: HttpErrorMessage | string): T {
    return setError.bind(this)(StatusCodes.UNAUTHORIZED, error);
  };

  target.forbidden = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.FORBIDDEN, body);
  };
  target.forbiddenMsg = function (error?: HttpErrorMessage | string): T {
    return setError.bind(this)(StatusCodes.FORBIDDEN, error);
  };

  target.notFound = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.NOT_FOUND, body);
  };
  target.notFoundMsg = function (error?: HttpErrorMessage | string): T {
    return setError.bind(this)(StatusCodes.NOT_FOUND, error);
  };

  target.methodNotAllowed = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.METHOD_NOT_ALLOWED, body);
  };
  target.methodNotAllowedMsg = function (error?: HttpErrorMessage | string): T {
    return setError.bind(this)(StatusCodes.METHOD_NOT_ALLOWED, error);
  };

  target.notAcceptable = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.NOT_ACCEPTABLE, body);
  };
  target.notAcceptableMsg = function (error?: HttpErrorMessage | string): T {
    return setError.bind(this)(StatusCodes.NOT_ACCEPTABLE, error);
  };

  target.requestTimeout = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.REQUEST_TIMEOUT, body);
  };
  target.requestTimeoutMsg = function (error?: HttpErrorMessage | string): T {
    return setError.bind(this)(StatusCodes.REQUEST_TIMEOUT, error);
  };

  target.conflict = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.CONFLICT, body);
  };
  target.conflictMsg = function (error?: HttpErrorMessage | string): T {
    return setError.bind(this)(StatusCodes.CONFLICT, error);
  };

  target.gone = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.GONE, body);
  };
  target.goneMsg = function (error?: HttpErrorMessage | string): T {
    return setError.bind(this)(StatusCodes.GONE, error);
  };

  target.preconditionFailed = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.PRECONDITION_FAILED, body);
  };
  target.preconditionFailedMsg = function (
    error?: HttpErrorMessage | string
  ): T {
    return setError.bind(this)(StatusCodes.PRECONDITION_FAILED, error);
  };

  target.requestTooLong = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.REQUEST_TOO_LONG, body);
  };
  target.requestTooLongMsg = function (error?: HttpErrorMessage | string): T {
    return setError.bind(this)(StatusCodes.REQUEST_TOO_LONG, error);
  };

  target.unsupportedMediaType = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.UNSUPPORTED_MEDIA_TYPE, body);
  };
  target.unsupportedMediaTypeMsg = function (
    error?: HttpErrorMessage | string
  ): T {
    return setError.bind(this)(StatusCodes.UNSUPPORTED_MEDIA_TYPE, error);
  };

  target.imATeapot = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.IM_A_TEAPOT, body);
  };
  target.imATeapotMsg = function (error?: HttpErrorMessage | string): T {
    return setError.bind(this)(StatusCodes.IM_A_TEAPOT, error);
  };

  target.misdirected = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.MISDIRECTED_REQUEST, body);
  };
  target.misdirectedMsg = function (error?: HttpErrorMessage | string): T {
    return setError.bind(this)(StatusCodes.MISDIRECTED_REQUEST, error);
  };

  target.unprocessableEntity = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.UNPROCESSABLE_ENTITY, body);
  };
  target.unprocessableEntityMsg = function (
    error?: HttpErrorMessage | string
  ): T {
    return setError.bind(this)(StatusCodes.UNPROCESSABLE_ENTITY, error);
  };

  target.internalServerError = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.INTERNAL_SERVER_ERROR, body);
  };
  target.internalServerErrorMsg = function (
    error?: HttpErrorMessage | string
  ): T {
    return setError.bind(this)(StatusCodes.INTERNAL_SERVER_ERROR, error);
  };

  target.notImplemented = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.NOT_IMPLEMENTED, body);
  };
  target.notImplementedMsg = function (error?: HttpErrorMessage | string): T {
    return setError.bind(this)(StatusCodes.NOT_IMPLEMENTED, error);
  };

  target.badGateway = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.BAD_GATEWAY, body);
  };
  target.badGatewayMsg = function (error?: HttpErrorMessage | string): T {
    return setError.bind(this)(StatusCodes.BAD_GATEWAY, error);
  };

  target.serviceUnavailable = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.SERVICE_UNAVAILABLE, body);
  };
  target.serviceUnavailableMsg = function (
    error?: HttpErrorMessage | string
  ): T {
    return setError.bind(this)(StatusCodes.SERVICE_UNAVAILABLE, error);
  };

  target.gatewayTimeout = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.GATEWAY_TIMEOUT, body);
  };
  target.gatewayTimeoutMsg = function (error?: HttpErrorMessage | string): T {
    return setError.bind(this)(StatusCodes.GATEWAY_TIMEOUT, error);
  };

  target.httpVersionNotSupported = function (body?: unknown): T {
    return setResult.bind(this)(StatusCodes.HTTP_VERSION_NOT_SUPPORTED, body);
  };
  target.httpVersionNotSupportedMsg = function (
    error?: HttpErrorMessage | string
  ): T {
    return setError.bind(this)(StatusCodes.HTTP_VERSION_NOT_SUPPORTED, error);
  };
}
