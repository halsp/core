import Middleware from "./Middleware";
import Request from "./Request";
import Response from "./Response";

export default class HttpContext {
  constructor(req: Request) {
    this.#req = req;
  }

  readonly #bag: { [k: string]: unknown } = {};

  public readonly mds: {
    mdf: () => Middleware;
    md?: Middleware;
  }[] = [];

  #res: Response = new Response();
  public get res(): Response {
    return this.#res;
  }

  #req: Request;
  public get req(): Request {
    return this.#req;
  }

  refresh(req: Request): HttpContext {
    this.#req = req;
    this.#res = new Response();
    return this;
  }

  public bag<T>(key: string): T;
  public bag<T>(key: string, value: T): HttpContext;

  public bag<T>(key: string, value?: T): HttpContext | T {
    if (value == undefined) {
      return this.#bag[key] as T;
    } else {
      this.#bag[key] = value;
      return this;
    }
  }
}
