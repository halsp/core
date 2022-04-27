import { HttpContext } from "../context";
import { LambdaMiddleware } from "./lambda.middleware";
import {
  Middleware,
  MiddlewareItem,
  invokeMiddlewares,
  MiddlewareConstructor,
} from "./middleware";

export class ComposeMiddleware extends Middleware {
  readonly #mds: MiddlewareItem[] = [];

  async invoke(): Promise<void> {
    const mds: MiddlewareItem[] = [
      ...this.#mds,
      new LambdaMiddleware(async () => {
        await this.next();
      }),
    ];
    await invokeMiddlewares(this.ctx, mds);
  }

  use(lambda: (ctx: HttpContext, next: () => Promise<void>) => void): this;
  use(
    lambda: (ctx: HttpContext, next: () => Promise<void>) => Promise<void>
  ): this;
  use(
    lambda:
      | ((ctx: HttpContext, next: () => Promise<void>) => void)
      | ((ctx: HttpContext, next: () => Promise<void>) => Promise<void>)
  ): this {
    this.#mds.push(() => new LambdaMiddleware(lambda));
    return this;
  }

  add(builder: (ctx: HttpContext) => Middleware): this;
  add(builder: (ctx: HttpContext) => Promise<Middleware>): this;
  add(builder: (ctx: HttpContext) => MiddlewareConstructor): this;
  add(builder: (ctx: HttpContext) => Promise<MiddlewareConstructor>): this;
  add(md: Middleware): this;
  add(md: MiddlewareConstructor): this;
  add(
    md:
      | ((ctx: HttpContext) => Middleware)
      | ((ctx: HttpContext) => Promise<Middleware>)
      | ((ctx: HttpContext) => MiddlewareConstructor)
      | ((ctx: HttpContext) => Promise<MiddlewareConstructor>)
      | Middleware
      | MiddlewareConstructor
  ): this {
    this.#mds.push(md);
    return this;
  }
}
