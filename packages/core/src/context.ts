import { Dict, isUndefined, isPlainObject, normalizePath } from "./utils";
import { Startup } from "./startup";

type BuilderBagType = "singleton" | "scoped" | "transient";
type BuilderBagItem<T> = {
  key: string;
  builder: () => T;
  type: BuilderBagType;
  isBuilderBag: true;
};

export class Request {
  readonly ctx!: Context;

  #body: unknown;
  public get body(): any {
    return this.#body;
  }
  setBody(body: unknown): this {
    this.#body = body;
    return this;
  }

  #path = "";
  public get path(): string {
    return this.#path;
  }
  #originalPath?: string;
  public get originalPath(): string | undefined {
    return this.#originalPath;
  }
  setPath(path: string): this {
    this.#originalPath = path
      ?.replace(/\?.*$/, "")
      ?.replace(/^https?:\/{1,2}[^\/]+/, "");
    this.#path = normalizePath(this.#originalPath);
    return this;
  }
}

export class Response {
  readonly ctx!: Context;

  public body?: any;
  public setBody(body?: any) {
    this.body = body;
    return this;
  }
}

export class Context {
  constructor(req: Request = new Request()) {
    this.#req = req;
    this.#res = new Response();

    Object.defineProperty(this.#req, "ctx", {
      configurable: true,
      get: () => this,
    });
    Object.defineProperty(this.#res, "ctx", {
      configurable: true,
      get: () => this,
    });
  }

  #req!: Request;
  get req() {
    return this.#req;
  }
  get request() {
    return this.#req;
  }

  #res!: Response;
  get res() {
    return this.#res;
  }
  get response() {
    return this.#res;
  }

  get logger() {
    return this.startup.logger;
  }

  readonly startup!: Startup;

  get #singletonBag() {
    const key = "@ipare/core/singletonBag";
    const singletonBag: Dict = this.startup[key] ?? {};
    this.startup[key] = singletonBag;
    return singletonBag;
  }
  readonly #scopedBag: Dict = {};
  readonly #bag: Dict = {};

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
      if (key in this.#singletonBag) {
        return this.#getBagValue(key, this.#singletonBag[key]);
      }
      if (key in this.#scopedBag) {
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
          dict = this.#singletonBag;
        } else {
          dict = this.#scopedBag;
        }

        if (!(key in dict)) {
          dict[key] = result.builder();
        }
        return dict[key];
      }
    } else {
      return result as T;
    }
  }

  readonly errorStack: any[] = [];
  public catchError(err: Error | any): this {
    this.errorStack.push(err);
    return this;
  }
}
