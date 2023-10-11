import { Context } from "../context";
import { LambdaMiddleware } from "./lambda.middleware";
import {
  Middleware,
  MiddlewareItem,
  invokeMiddlewares,
  MiddlewareConstructor,
} from "./middleware";

export class ComposeMiddleware extends Middleware {
  constructor(
    private readonly enable?: (ctx: Context) => boolean | Promise<boolean>,
  ) {
    super();
  }

  readonly #mds: MiddlewareItem[] = [];

  async invoke(): Promise<void> {
    if (this.enable && !(await this.enable(this.ctx))) {
      await this.next();
      return;
    }

    const mds: MiddlewareItem[] = [
      ...this.#mds,
      new LambdaMiddleware(async () => {
        await this.next();
      }),
    ];
    await invokeMiddlewares(this.ctx, mds);
  }

  use(lambda: (ctx: Context, next: () => Promise<void>) => Promise<void>): this;
  use(lambda: (ctx: Context, next: () => Promise<void>) => void): this;
  use(
    lambda:
      | ((ctx: Context, next: () => Promise<void>) => void)
      | ((ctx: Context, next: () => Promise<void>) => Promise<void>),
  ): this {
    this.#mds.push(() => new LambdaMiddleware(lambda));
    return this;
  }

  add(
    builder: (ctx: Context) => Middleware,
    type?: MiddlewareConstructor,
  ): this;
  add(
    builder: (ctx: Context) => Promise<Middleware>,
    type?: MiddlewareConstructor,
  ): this;
  add(
    builder: (ctx: Context) => MiddlewareConstructor,
    type?: MiddlewareConstructor,
  ): this;
  add(
    builder: (ctx: Context) => Promise<MiddlewareConstructor>,
    type?: MiddlewareConstructor,
  ): this;
  add(md: Middleware): this;
  add(md: MiddlewareConstructor): this;
  add(
    md:
      | ((ctx: Context) => Middleware)
      | ((ctx: Context) => Promise<Middleware>)
      | ((ctx: Context) => MiddlewareConstructor)
      | ((ctx: Context) => Promise<MiddlewareConstructor>)
      | Middleware
      | MiddlewareConstructor,
    type?: MiddlewareConstructor,
  ): this {
    if (type) {
      this.#mds.push([md as any, type]);
    } else {
      this.#mds.push(md);
    }
    return this;
  }
}
