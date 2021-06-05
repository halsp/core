import StatusCode from "./StatusCode";

export default class Response {
  constructor(
    public status: StatusCode | number = StatusCode.notFound,
    public body: unknown = undefined,
    public readonly headers = <Record<string, string | string[] | undefined>>{
      sfa: "https://github.com/sfajs/sfa",
    }
  ) {}

  get isSuccess(): boolean {
    return this.status >= 200 && this.status < 300;
  }

  setHeaders(
    ...headers: { key: string; value?: string | string[] }[]
  ): Response {
    headers.forEach((header) => {
      this.headers[header.key] = header.value;
    });
    return this;
  }

  setHeader(key: string, value?: string | string[]): Response {
    return this.setHeaders({ key, value });
  }
}
