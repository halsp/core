import { isFunction, isNumber } from "@halsp/common";
import { HttpResponse } from "@halsp/http";

declare module "@halsp/http" {
  interface HttpResponse {
    expect(status: number): this;
    expect(status: number, body: any): this;
    expect(checker: (res: HttpResponse) => void): this;
    expect(body: any): this;
  }
}

HttpResponse.prototype.expect = function customExpect(...args: any[]) {
  const arg0 = args[0];
  const arg1 = args[1];
  if (isFunction(arg0)) {
    arg0(this);
  } else if (isNumber(arg0)) {
    expect(this.status).toBe(arg0);
    if (args.length >= 2) {
      expect(this.body).toEqual(arg1);
    }
  } else {
    expect(this.body).toEqual(arg0);
  }
  return this;
};
