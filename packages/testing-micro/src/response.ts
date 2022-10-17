import { Response } from "@ipare/core";

declare module "@ipare/core" {
  interface Response {
    expect(body: any): this;
  }
}

Response.prototype.expect = function customExpect(body: any) {
  expect(this.body).toEqual(body);
  return this;
};
