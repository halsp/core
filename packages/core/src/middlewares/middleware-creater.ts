import { HttpContext } from "../context";
import { Middleware } from "./middleware";
import { isMiddlewareConstructor, MiddlewareItem } from "./utils";

export class MiddlewareCreater extends Object {
  constructor(
    private readonly ctx: HttpContext,
    private readonly middleware: MiddlewareItem
  ) {
    super();
  }

  async create(): Promise<Middleware> {
    if (this.middleware instanceof Middleware) {
      return this.middleware;
    } else if (isMiddlewareConstructor(this.middleware)) {
      return new this.middleware();
    } else {
      return await this.middleware(this.ctx);
    }
  }
}

export async function createMiddleware(
  ctx: HttpContext,
  md: MiddlewareItem
): Promise<Middleware> {
  return await new MiddlewareCreater(ctx, md).create();
}
