import { Response } from "@halsp/common";

export class MicroResponse extends Response {
  constructor(public payload: any = undefined) {
    super();
  }

  setPayload(val: unknown): this {
    this.payload = val;
    return this;
  }

  error?: string;
  setError(val?: string) {
    this.error = val;
    return this;
  }
}
