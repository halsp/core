import HttpContext from "../HttpContext";
import ResultHandler from "../ResultHandler";

export type MdType = () => Middleware;

export default abstract class Middleware extends ResultHandler {
  #index!: number;
  #mds!: readonly MdType[];

  #ctx!: HttpContext;
  public get ctx(): HttpContext {
    return this.#ctx;
  }

  abstract invoke(): Promise<void>;
  protected async next(): Promise<void> {
    if (this.#mds.length <= this.#index + 1) return;
    const nextMd = this.#mds[this.#index + 1]();
    nextMd.init(this.ctx, this.#index + 1, this.#mds);
    await nextMd.invoke();
  }

  private init(
    ctx: HttpContext,
    index: number,
    mds: readonly MdType[]
  ): Middleware {
    this.#mds = mds;
    this.#ctx = ctx;
    this.#index = index;
    return this;
  }
}
