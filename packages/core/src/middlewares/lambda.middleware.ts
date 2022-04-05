import { HttpContext } from "../context";
import { Middleware } from "./middleware";

export class LambdaMiddleware extends Middleware {
  constructor(
    private readonly builder:
      | ((ctx: HttpContext) => void)
      | ((ctx: HttpContext, next: () => Promise<void>) => Promise<void>)
  ) {
    super();
  }

  async invoke(): Promise<void> {
    await this.builder(this.ctx, this.next.bind(this));
  }
}
