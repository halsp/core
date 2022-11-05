import { isFunction, Response } from "@ipare/core";

declare module "@ipare/core" {
  interface Response {
    expect(status: string | undefined): this;
    expect(status: string | undefined, body: any): this;
    expect(checker: (res: Response) => void): this;
  }
}

Response.prototype.expect = function customExpect(...args: any[]) {
  const arg0 = args[0];
  const arg1 = args[1];
  if (isFunction(arg0)) {
    arg0(this);
  } else {
    expect(this.status).toBe(arg0);
    if (args.length >= 2) {
      expect(this.body).toEqual(arg1);
    }
  }
  return this;
};
