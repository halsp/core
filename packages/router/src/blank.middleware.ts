import { Middleware } from "@halsp/core";

export class BlankMiddleware extends Middleware {
  async invoke(): Promise<void> {
    await this.next();
  }
}
