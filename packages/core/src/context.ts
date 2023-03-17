import { normalizePath } from "./utils";
import { Startup } from "./startup";
import * as honion from "honion";

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

export class Context extends honion.Context {
  constructor(req: Request = new Request()) {
    super();
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

  get startup(): Startup {
    return this.honion as Startup;
  }
}
