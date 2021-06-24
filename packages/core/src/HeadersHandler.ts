type headerValueType = string | string[];
type numericalHeaderValueType = headerValueType | number | (number | string)[];
type headersType = Record<string, headerValueType>;

export default class HeadersHandler {
  #headers: headersType = {};

  setHeaders(headers: Record<string, numericalHeaderValueType>): this {
    for (const key in headers) {
      this.setHeader(key, headers[key]);
    }
    return this;
  }

  setHeader(key: string, value: numericalHeaderValueType): this {
    if (value == undefined) return this;

    if (Array.isArray(value)) {
      this.#headers[key] = value.map((item) =>
        typeof item == "string" ? item : String(item)
      );
    } else if (typeof value != "string") {
      this.#headers[key] = String(value);
    } else {
      this.#headers[key] = value;
    }
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

  getHeader(key: string): headerValueType | undefined {
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
      } else {
        result[key] = value;
      }
    });
    return result;
  }
}
