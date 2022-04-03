import { HttpContext } from "../context";
import { Middleware } from "./middleware";

export type LambdaMiddlewareBuilder = (
  ctx: HttpContext,
  next: () => Promise<void>
) => void;
export type LambdaMiddlewareBuilderAsync = (
  ctx: HttpContext,
  next: () => Promise<void>
) => Promise<void>;

export class LambdaMiddleware extends Middleware {
  constructor(
    private readonly builder:
      | LambdaMiddlewareBuilderAsync
      | LambdaMiddlewareBuilder
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
