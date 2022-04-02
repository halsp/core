import http from "http";

export class TransResponse extends http.ServerResponse {
  #headers: NodeJS.Dict<http.OutgoingHttpHeader> = {};
  #status = 404;

  get headers(): NodeJS.Dict<http.OutgoingHttpHeader> {
    return this.#headers;
  }

  setHeader(name: string, value: http.OutgoingHttpHeader): this {
    this.#headers[name] = value;
    return this;
  }

  removeHeader(name: string): void {
    delete this.#headers[name];
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

  getHeaders(): NodeJS.ReadOnlyDict<http.OutgoingHttpHeader> {
    return this.#headers;
  }

  getHeaderNames(): string[] {
    return Object.keys(this.#headers);
  }

  hasHeader(name: string): boolean {
    return this.getHeaderNames()
      .map((h) => h.toLowerCase())
      .includes(name.toLowerCase());
  }

  getHeader(name: string): string | string[] | number | undefined {
    for (const key of this.getHeaderNames()) {
      if (key.toLowerCase() == name.toLowerCase()) {
        return this.#headers[key];
      }
    }
  }
}
