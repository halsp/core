import * as http from "http";

export default class TransResponse extends http.ServerResponse {
  #headers: NodeJS.Dict<http.OutgoingHttpHeader> = {};

  get headers(): NodeJS.Dict<http.OutgoingHttpHeader> {
    return this.#headers;
  }

  setHeader(key: string, value: http.OutgoingHttpHeader): this {
    this.#headers[key] = value;
    if (!this.headersSent) {
      super.setHeader(key, value);
    }
    return this;
  }

  removeHeader(name: string): void {
    delete this.#headers[name];
    if (!this.headersSent) {
      super.removeHeader(name);
    }
  }

  writeHead(statusCode: number, ...params: unknown[]): this {
    let reasonPhrase;
    let headers: NodeJS.Dict<http.OutgoingHttpHeader>;
    if (params.length == 2) {
      headers = params[1] as NodeJS.Dict<http.OutgoingHttpHeader>;
      reasonPhrase = params[0] as string;
    } else {
      headers = params[0] as NodeJS.Dict<http.OutgoingHttpHeader>;
    }

    for (const name in headers) {
      const headerValue = headers[name];
      this.setHeader(name, headerValue as http.OutgoingHttpHeader);
    }

    super.writeHead(statusCode, reasonPhrase, headers);
    return this;
  }
}
