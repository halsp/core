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

const singletonBagMap = new WeakMap<Startup, Dict>();
export class Context {
  constructor() {
    this.#req = new Request();
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
  set logger(val) {
    this.startup.logger = val;
  }

  readonly startup!: Startup;

  get #singletonBag() {
    if (!singletonBagMap.has(this.startup)) {
      singletonBagMap.set(this.startup, {});
    }
    return singletonBagMap.get(this.startup) as Dict;
  }
  readonly #scopedBag: Dict = {};
  readonly #bag: Dict = {};

  public get<T>(key: string): T {
    if (key in this.#singletonBag) {
      return this.#getBagValue(key, this.#singletonBag[key]);
    } else if (key in this.#scopedBag) {
      return this.#getBagValue(key, this.#scopedBag[key]);
    } else {
      const result: BuilderBagItem<T> | T = this.#bag[key];
      return this.#getBagValue(key, result);
    }
  }

  public set<T>(key: string, value: T): this;
  public set<T>(key: string, type: BuilderBagType, builder: () => T): this;
  public set<T>(key: string, arg1?: any, arg2?: any): this | T {
    if (!isUndefined(arg2)) {
      this.#bag[key] = <BuilderBagItem<T>>{
        type: arg1,
        builder: arg2,
        isBuilderBag: true,
      };
      return this;
    } else {
      this.#bag[key] = arg1;
      return this;
    }
  }

  public has(key: string): boolean {
    return key in this.#bag;
  }

  public delete(key: string): boolean {
    const hasKey = this.has(key);

    delete this.#bag[key];
    delete this.#singletonBag[key];
    delete this.#scopedBag[key];

    return hasKey;
  }

  public get length() {
    return Object.keys(this.#bag).length;
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
}
