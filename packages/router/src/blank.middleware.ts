import { Middleware } from "@halsp/common";

export class BlankMiddleware extends Middleware {
  async invoke(): Promise<void> {
    await this.next();
  }
}
