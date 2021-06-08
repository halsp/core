export default class HttpMethod {
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

  static readonly custom = <string[]>[];

  static matched(method: string | undefined): string | undefined {
    if (!method) return undefined;
    switch (method.toString().toUpperCase()) {
      case this.get:
      case this.post:
      case this.put:
      case this.delete:
      case this.patch:
      case this.head:
      case this.options:
      case this.trace:
      case this.connect:
        return method.toString().toUpperCase();
      case this.any:
        return method.toString().toUpperCase();
      default:
        return this.custom.filter((item) => this.equal(item, method))[0];
    }
  }

  static equal(
    method1: string | undefined,
    method2: string | undefined
  ): boolean {
    if (!method1 && !method2) {
      return true;
    } else if (method1 && method2) {
      const m1 = method1.toString().toUpperCase();
      const m2 = method2.toString().toUpperCase();
      return m1 == m2;
    } else {
      return false;
    }
  }
}
