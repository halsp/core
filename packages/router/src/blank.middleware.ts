import { Middleware } from "@sfajs/core";

export class BlanlMiddleware extends Middleware {
  async invoke(): Promise<void> {
    await this.next();
  }
}
