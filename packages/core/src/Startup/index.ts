import { MdType } from "../Middleware";
import Response from "../Response";
import HttpContext from "../HttpContext";
import LambdaMiddleware, { LambdaMdType } from "../Middleware/LambdaMiddleware";
import ResponseError from "../Response/ResponseError";

export default abstract class Startup {
  #mds: MdType[] = [];

  use<T extends this>(mdBuilder: MdType | LambdaMdType): T {
    if (!mdBuilder) throw new Error();

    let builder;
    if (mdBuilder.length > 0) {
      builder = () => new LambdaMiddleware(mdBuilder as LambdaMdType);
    } else {
      builder = mdBuilder as MdType;
    }

    this.#mds.push(builder);

    return this as T;
  }

  protected async invoke(ctx: HttpContext): Promise<Response> {
    if (!this.#mds.length) {
      return ctx.res;
    }

    try {
      const md = this.#mds[0]();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (md as any).init(ctx, 0, this.#mds).invoke();
    } catch (err) {
      if (err instanceof ResponseError) {
        err.writeToCtx(ctx);
      } else {
        throw err;
      }
    }

    return ctx.res;
  }
}
