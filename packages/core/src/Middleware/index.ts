import HttpContext from "../HttpContext";
import ResultHandler from "../ResultHandler";

export default abstract class Middleware extends ResultHandler {
  #index!: number;
  #mds!: readonly ((ctx: HttpContext) => Middleware)[];

  #ctx!: HttpContext;
  public get ctx(): HttpContext {
    return this.#ctx;
  }

  abstract invoke(): Promise<void>;
  protected async next(): Promise<void> {
    if (this.#mds.length <= this.#index + 1) return;
    const nextMd = this.#mds[this.#index + 1](this.ctx);
    nextMd.init(this.ctx, this.#index + 1, this.#mds);
    await nextMd.invoke();
  }

  private init(
    ctx: HttpContext,
    index: number,
    mds: readonly ((ctx: HttpContext) => Middleware)[]
  ): Middleware {
    this.#mds = mds;
    this.#ctx = ctx;
    this.#index = index;
    return this;
  }
}
