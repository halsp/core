import { Context, isNil, isObject } from "@halsp/common";
import { HttpException, InternalServerErrorException } from "../exceptions";
import { HttpRequest } from "./request";
import { HttpResponse } from "./response";
import { initResultHandler, ResultHandler } from "./result-handler";

export { ResultHandler, initResultHandler } from "./result-handler";
export { HeaderHandler, initHeaderHandler } from "./header-handler";
export { HttpRequest } from "./request";
export { HttpResponse } from "./response";

export class HttpContext extends Context<HttpRequest, HttpResponse> {
  constructor(req?: HttpRequest) {
    super(req ?? new HttpRequest(), new HttpResponse());

    initResultHandler(this, function () {
      return this.res;
    });
  }

  catchError(err: any): this {
    super.catchError(err);

    if (err instanceof HttpException) {
      this.res
        .setHeaders(err.headers)
        .setStatus(err.status)
        .setBody(err.toPlainObject());
    } else if (err instanceof Error) {
      const msg = err.message || undefined;
      this.catchError(new InternalServerErrorException(msg));
    } else if (isObject(err)) {
      this.catchError(new InternalServerErrorException(err));
    } else {
      const error = (!isNil(err) && String(err)) || undefined;
      this.catchError(new InternalServerErrorException(error));
    }

    return this;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HttpContext extends ResultHandler {}
