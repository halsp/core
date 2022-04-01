import { Middleware } from "@sfajs/core";
import { INJECT_DECORATOR_SCOPED_BAG } from "../../constant";

export class InjectDecoratorMiddleware extends Middleware {
  async invoke(): Promise<void> {
    this.ctx.bag(INJECT_DECORATOR_SCOPED_BAG, []);
    await this.next();
  }
}
