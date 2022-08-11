import { Request } from "./request";
import { Response } from "./response";
import { ResultHandler } from "./result-handler";
import { HttpException, InternalServerErrorException } from "../exceptions";
import { isNil, isObject, Dict, isUndefined, isPlainObject } from "../utils";
import { Startup } from "../startup";

type BuilderBagType = "singleton" | "scoped" | "transient";
type BuilderBagItem<T> = {
  key: string;
  builder: () => T;
  type: BuilderBagType;
  isBuilderBag: true;
};

export class HttpContext extends ResultHandler {
  constructor(req: Request) {
    super(
      () => this.#res,
      () => this.#req.headers
    );

    this.#req = req;
    (this.#req as any).ctx = this;
    (this.#res as any).ctx = this;
  }

  readonly startup!: Startup;

  static readonly #singletonBag: Dict = {};
  readonly #scopedBag: Dict = {};
  readonly #bag: Dict = {};

  readonly #res = new Response();
  public get res(): Response {
    return this.#res;
  }
  public get response(): Response {
    return this.res;
  }

  readonly #req: Request;
  public get req(): Request {
    return this.#req;
  }
  public get request(): Request {
    return this.req;
  }

  public bag<T>(key: string): T;
  public bag<T>(key: string, value: T): this;
  public bag<T>(key: string, type: BuilderBagType, builder: () => T): this;
  public bag<T>(key: string, arg1?: any, arg2?: any): this | T {
    if (!isUndefined(arg1) && !isUndefined(arg2)) {
      this.#bag[key] = <BuilderBagItem<T>>{
        type: arg1,
        builder: arg2,
        isBuilderBag: true,
      };
      return this;
    } else if (!isUndefined(arg1)) {
      this.#bag[key] = arg1;
      return this;
    } else {
      if (
        Object.prototype.hasOwnProperty.call(HttpContext.#singletonBag, key)
      ) {
        return this.#getBagValue(key, HttpContext.#singletonBag[key]);
      }
      if (Object.prototype.hasOwnProperty.call(this.#scopedBag, key)) {
        return this.#getBagValue(key, this.#scopedBag[key]);
      }
      const result: BuilderBagItem<T> | T = this.#bag[key];
      return this.#getBagValue(key, result);
    }
  }

  #getBagValue<T>(key: string, result: BuilderBagItem<T> | T) {
    if (isPlainObject(result) && result.isBuilderBag) {
      if (result.type == "transient") {
        return result.builder();
      } else {
        let dict: Dict;
        if (result.type == "singleton") {
          dict = HttpContext.#singletonBag;
        } else {
          dict = this.#scopedBag;
        }

        const exist = Object.prototype.hasOwnProperty.call(dict, key);
        if (!exist) {
          dict[key] = result.builder();
        }
        return dict[key];
      }
    } else {
      return result as T;
    }
  }

  public catchError(err: HttpException | Error | any): this {
    if (err instanceof HttpException) {
      this.setHeaders(err.header.headers)
        .res.setStatus(err.status)
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
