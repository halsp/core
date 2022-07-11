import { Middleware } from "@ipare/core";

export class BlankMiddleware extends Middleware {
  async invoke(): Promise<void> {
    await this.next();
  }
}
