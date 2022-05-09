export class HttpMethod {
  static readonly any = "ANY";
  static readonly get = "GET";
  static readonly post = "POST";
  static readonly put = "PUT";
  static readonly delete = "DELETE";
  static readonly patch = "PATCH";
  static readonly head = "HEAD";
  static readonly options = "OPTIONS";
  static readonly trace = "TRACE";
  static readonly connect = "CONNECT";

  static matched(
    method: string,
    customMethods: string[] = []
  ): string | undefined {
    if (!method) return undefined;
    switch (method.toUpperCase()) {
      case this.get:
      case this.post:
      case this.put:
      case this.delete:
      case this.patch:
      case this.head:
      case this.options:
      case this.trace:
      case this.connect:
      case this.any:
        return method.toUpperCase();
      default: {
        return customMethods.filter((item) => this.equal(item, method))[0];
      }
    }
  }

  static equal(method1?: string, method2?: string): boolean {
    return (method1 ?? "").toUpperCase() == (method2 ?? "").toUpperCase();
  }
}
