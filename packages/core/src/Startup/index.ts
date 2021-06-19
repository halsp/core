import Response from "../Response";
import HttpContext from "../HttpContext";
import LambdaMiddleware from "../Middleware/LambdaMiddleware";
import Middleware from "../Middleware";

export default abstract class Startup {
  #mds: ((ctx: HttpContext) => Middleware)[] = [];

  use<T extends this>(
    builder: (ctx: HttpContext, next: () => Promise<void>) => Promise<void>
  ): T {
    this.#mds.push(() => new LambdaMiddleware(builder));
    return this as T;
  }

  add<T extends this>(md: ((ctx: HttpContext) => Middleware) | Middleware): T {
    if (md instanceof Middleware) {
      this.#mds.push(() => md);
    } else {
      this.#mds.push(md);
    }
    return this as T;
  }

  protected async invoke(ctx: HttpContext): Promise<Response> {
    if (!this.#mds.length) {
      return ctx.res;
    }

    const md = this.#mds[0](ctx);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (md as any).init(ctx, 0, this.#mds).invoke();

    return ctx.res;
  }
}
