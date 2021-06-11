import HttpContext from "../HttpContext";
import ResultHandler from "../HttpContext/ResultHandler";

export default abstract class Middleware extends ResultHandler {
  constructor(public readonly cache: boolean = true) {
    super();
  }

  #index!: number;

  #ctx!: HttpContext;
  public get ctx(): HttpContext {
    return this.#ctx;
  }

  abstract invoke(): Promise<void>;
  protected async next(): Promise<void> {
    if (this.ctx.mds.length <= this.#index + 1) return;
    const { builder, md } = this.ctx.mds[this.#index + 1];
    let nextMd;
    if (md && md.cache) {
      nextMd = md;
    } else {
      nextMd = builder();
    }
    this.ctx.mds[this.#index + 1].md = nextMd;
    nextMd.init(this.ctx, this.#index + 1);
    await nextMd.invoke();
  }

  private init(ctx: HttpContext, index: number): Middleware {
    this.#ctx = ctx;
    this.#index = index;
    return this;
  }
}
