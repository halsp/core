import { Middleware } from "@halsp/common";
import {
  HeaderHandler,
  HttpContext,
  HttpRequest,
  HttpResponse,
  initHeaderHandler,
  initResultHandler,
  ResultHandler,
} from "./context";

export abstract class HttpMiddleware extends Middleware<
  HttpRequest,
  HttpResponse,
  HttpContext
> {
  constructor() {
    super();

    initResultHandler(this, function () {
      return this.res;
    });
    initHeaderHandler(
      this,
      () => {
        return this.ctx.req.headers;
      },
      () => {
        return this.ctx.res.headers;
      }
    );
  }

  public get req(): HttpRequest {
    return this.ctx.req;
  }
  public get request(): HttpRequest {
    return this.req;
  }
  public get res(): HttpResponse {
    return this.ctx.res;
  }
  public get response(): HttpResponse {
    return this.res;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HttpMiddleware extends ResultHandler, HeaderHandler {}
