import Middleware from "./Middleware";
import Request from "./Request";
import Response from "./Response";

export default class HttpContext {
  readonly #bag: { [k: string]: unknown } = {};

  public readonly mds: {
    mdf: () => Middleware;
    md?: Middleware;
  }[] = [];

  constructor(public readonly req: Request, public readonly res: Response) {}

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
