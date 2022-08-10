import { Middleware, HttpMethod } from "@ipare/core";
import { FileOptions, DirectoryOptions } from "../options";

export abstract class BaseMiddleware extends Middleware {
  readonly options!: FileOptions | DirectoryOptions;

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

  private get isPathValidated(): boolean {
    if (this.ctx.req.path.includes("..")) {
      return false;
    } else {
      return true;
    }
  }

  protected get isReqValidated(): boolean {
    return this.isMethodValid && this.isPathValidated;
  }

  protected setFile(file: string, is404 = false): void {
    this.ctx.bag("STATIC_FILE", file);
    if (is404) {
      this.ctx.bag("STATIC_FILE_404", true);
    }
  }
}
