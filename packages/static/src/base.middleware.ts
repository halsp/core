import { Middleware, HttpMethod } from "@sfajs/core";
import { SingleStaticOptions, StaticOptions } from "./static-options";

export abstract class BaseMiddleware extends Middleware {
  readonly options!: StaticOptions | SingleStaticOptions;

  private get isMethodValid(): boolean {
    if (!this.options.method) {
      return this.ctx.req.method == HttpMethod.get;
    }
    if (Array.isArray(this.options.method)) {
      const methods = this.options.method.map((m) => m.toUpperCase());
      return (
        methods.includes(HttpMethod.any) ||
        methods.includes(this.ctx.req.method)
      );
    } else {
      if (this.options.method.toUpperCase() == HttpMethod.any) return true;
      if (this.ctx.req.method == this.options.method.toUpperCase()) return true;
      return false;
    }
  }

  private get isPathValid(): boolean {
    if (this.ctx.req.path.includes("..")) {
      return false;
    } else {
      return true;
    }
  }

  protected get isReqValida(): boolean {
    return this.isMethodValid && this.isPathValid;
  }

  protected setFile(file: string, is404 = false): void {
    this.ctx.bag("STATIC_FILE", file);
    if (is404) {
      this.ctx.bag("STATIC_FILE_404", true);
    }
  }
}
