import { HttpContext } from "../context/HttpContext";
import { Middleware } from "./Middleware";

export class LambdaMiddleware extends Middleware {
  constructor(
    private readonly builder:
      | ((ctx: HttpContext, next: () => Promise<void>) => Promise<void>)
      | ((ctx: HttpContext, next: () => Promise<void>) => void)
  ) {
    super();
  }

  async invoke(): Promise<void> {
    const result = this.builder(this.ctx, this.next.bind(this));
    if (result instanceof Promise) {
      await result;
    }
  }
}
