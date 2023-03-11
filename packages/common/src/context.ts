import { Startup } from "./startup";
import * as honion from "honion";

export class Request<TRes extends Response = Response<any>> {
  readonly ctx!: Context<this, TRes>;
}

export class Response<TReq extends Request = Request<any>> {
  readonly ctx!: Context<TReq, this>;
}

export class Context<
  TReq extends Request = Request,
  TRes extends Response = Response
> extends honion.Context {
  constructor(req?: TReq, res?: TRes) {
    super();
    this.#req = req ?? (new Request() as TReq);
    this.#res = res ?? (new Response() as TRes);

    Object.defineProperty(this.#req, "ctx", {
      configurable: true,
      get: () => this,
    });
    Object.defineProperty(this.#res, "ctx", {
      configurable: true,
      get: () => this,
    });
  }

  #req!: TReq;
  get req() {
    return this.#req;
  }
  get request() {
    return this.#req;
  }

  #res!: TRes;
  get res() {
    return this.#res;
  }
  get response() {
    return this.#res;
  }

  get startup(): Startup {
    return this.honion as Startup;
  }
}
