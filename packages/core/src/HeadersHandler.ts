type headerValueType = string | string[] | undefined;
type headersType = Record<string, headerValueType>;

export default class HeadersHandler {
  #headers: headersType = {};

  setHeaders(headers: headersType): this {
    Object.assign(this.#headers, headers);
    return this;
  }

  setHeader(key: string, value?: string | string[]): this {
    this.#headers[key] = value;
    return this;
  }

  hasHeader(key: string): string | false {
    for (const item of Object.keys(this.#headers)) {
      if (item.toUpperCase() == key.toUpperCase()) {
        return item;
      }
    }
    return false;
  }

  removeHeader(key: string): this {
    const existKey = this.hasHeader(key);
    if (existKey) {
      delete this.#headers[existKey];
    }
    return this;
  }

  getHeader(key: string): string | string[] | undefined {
    const existKey = this.hasHeader(key);
    if (existKey) {
      return this.#headers[existKey];
    }
  }

  get headers(): headersType {
    const result = <headersType>{};
    Object.keys(this.#headers).forEach((key) => {
      const value = this.#headers[key];
      if (Array.isArray(value)) {
        result[key] = (<string[]>[]).concat(value);
      } else if (typeof value == "string") {
        result[key] = value;
      } else {
        result[key] = undefined;
      }
    });
    return result;
  }
}
