import Middleware from ".";
import HttpContext from "../HttpContext";

class SimpleMiddleware extends Middleware {
  constructor(
    private readonly mdf: (
      ctx: HttpContext,
      next: () => Promise<void>
    ) => Promise<void>
  ) {
    super();
  }

  async invoke(): Promise<void> {
    await this.mdf(this.ctx, this.next.bind(this));
  }
}

export default SimpleMiddleware;
