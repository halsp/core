import HttpContext from "../conext/HttpContext";
import Middleware from "./Middleware";

export default class LambdaMiddleware extends Middleware {
  constructor(
    private readonly builder: (
      ctx: HttpContext,
      next: () => Promise<void>
    ) => Promise<void>
  ) {
    super();
  }

  async invoke(): Promise<void> {
    await this.builder(this.ctx, this.next.bind(this));
  }
}
