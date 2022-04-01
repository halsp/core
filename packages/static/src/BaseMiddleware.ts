import { Middleware, HttpMethod } from "@sfajs/core";
import { SingleStaticConfig, StaticConfig } from "./StaticConfig";

export abstract class BaseMiddleware extends Middleware {
  readonly cfg!: StaticConfig | SingleStaticConfig;

  private get isMethodValid(): boolean {
    if (!this.cfg.method) {
      return this.ctx.req.method == HttpMethod.get;
    }
    if (Array.isArray(this.cfg.method)) {
      const methods = this.cfg.method.map((m) => m.toUpperCase());
      return (
        methods.includes(HttpMethod.any) ||
        methods.includes(this.ctx.req.method)
      );
    } else {
      if (this.cfg.method.toUpperCase() == HttpMethod.any) return true;
      if (this.ctx.req.method == this.cfg.method.toUpperCase()) return true;
      return false;
    }
  }

  private get isPathValid(): boolean {
    if ((this.ctx.req.path ?? "").includes("..")) {
      return false;
    } else {
      return true;
    }
  }

  protected get isReqValida(): boolean {
    return this.isMethodValid && this.isPathValid;
  }

  protected trimPath(str: string): string {
    let result = str;
    while (result.startsWith("/") || result.startsWith("\\")) {
      result = result.substr(1, result.length - 1);
    }
    while (result.endsWith("/") || result.endsWith("\\")) {
      result = result.substr(0, result.length - 1);
    }
    return result;
  }

  protected setFile(file: string, is404 = false): void {
    this.ctx.bag("STATIC_FILE", file);
    if (is404) {
      this.ctx.bag("STATIC_FILE_404", true);
    }
  }
}
