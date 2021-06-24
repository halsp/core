import HeadersHandler from "../HeadersHandler";
import HttpMethod from "./HttpMethod";

export default class Request extends HeadersHandler {
  readonly params: NodeJS.Dict<string> = {};

  #body: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get body(): any {
    return this.#body;
  }

  #path = "";
  public get path(): string {
    return this.#path;
  }

  public get overrideMethod(): string | undefined {
    if (
      this.#method &&
      this.#method.toUpperCase() != this.method.toUpperCase()
    ) {
      return this.#method;
    }
  }

  #method = HttpMethod.any;
  public get method(): string {
    const ovrdHeaderKey = "X-HTTP-Method-Override";
    const ovrdKey = Object.keys(this.headers).filter(
      (h) => h.toUpperCase() == ovrdHeaderKey.toUpperCase()
    )[0];
    if (ovrdKey) {
      const ovrdValue = this.headers[ovrdKey];
      if (ovrdValue && typeof ovrdValue == "string") {
        return ovrdValue.toUpperCase();
      } else if (ovrdValue && Array.isArray(ovrdValue) && ovrdValue.length) {
        return ovrdValue[0].toUpperCase();
      }
    }
    return this.#method;
  }

  setPath(path: string): Request {
    if (!!path && (path.startsWith("/") || path.startsWith("\\"))) {
      this.#path = path.substr(1, path.length - 1);
    } else {
      this.#path = path;
    }
    return this;
  }

  setMethod(method: string): Request {
    this.#method = method?.toUpperCase();
    return this;
  }

  setBody(body: unknown): Request {
    this.#body = body;
    return this;
  }

  setParams(params: NodeJS.Dict<string>): Request {
    Object.assign(this.params, params);
    return this;
  }

  setParam(key: string, value?: string): Request {
    this.params[key] = value;
    return this;
  }
}
