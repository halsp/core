import HttpContext from "../Context/HttpContext";
import ResultHandler from "../Context/ResultHandler";

export default abstract class Middleware extends ResultHandler {
  constructor() {
    super(() => this.ctx.res);
  }

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
  ): this {
    this.#mds = mds;
    this.#ctx = ctx;
    this.#index = index;
    return this;
  }
}
