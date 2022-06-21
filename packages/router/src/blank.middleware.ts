import { Middleware } from "@sfajs/core";

export class BlankMiddleware extends Middleware {
  async invoke(): Promise<void> {
    await this.next();
  }
}
