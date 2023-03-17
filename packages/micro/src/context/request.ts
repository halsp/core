import { Request } from "@halsp/common";

export class MicroRequest extends Request {
  id?: string;
  setId(val?: string) {
    this.id = val;
    return this;
  }

  #payload: any;
  public get payload(): any {
    return this.#payload;
  }
  setPayload(val: any): this {
    this.#payload = val;
    return this;
  }

  #pattern = "";
  public get pattern(): string {
    return this.#pattern;
  }
  setPattern(val: string): this {
    this.#pattern = val;
    return this;
  }
}
