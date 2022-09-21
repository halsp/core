import { Middleware } from "@ipare/core";
import { HttpMethod } from "@ipare/http";
import { FILE_404_BAG, FILE_BAG } from "../constant";
import { FileOptions, DirectoryOptions } from "../options";

export abstract class BaseMiddleware extends Middleware {
  readonly options!: FileOptions | DirectoryOptions;

  protected get isMethodValid(): boolean {
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

  protected setBagFile(file: string, is404 = false): void {
    this.ctx.bag(FILE_BAG, file);
    if (is404) {
      this.ctx.bag(FILE_404_BAG, true);
    }
  }
}
