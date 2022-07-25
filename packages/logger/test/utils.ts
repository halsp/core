import { Transport } from "../src";

export class CustomTransport extends Transport {
  constructor(private readonly data: any[]) {
    super();
  }

  log(info: any, next: () => void) {
    this.data.push(info);
    next();
  }
}
