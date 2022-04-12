import { HttpContext } from "../context";
import { Middleware } from "./middleware";

type builderType =
  | ((ctx: HttpContext, next: () => Promise<void>) => void)
  | ((ctx: HttpContext, next: () => Promise<void>) => Promise<void>);

export class LambdaMiddleware extends Middleware {
  constructor(builder: builderType) {
    super();
    this.#builder = builder;
  }

  #builder: builderType;

  async invoke(): Promise<void> {
    await this.#builder(this.ctx, this.next.bind(this));
  }
}
