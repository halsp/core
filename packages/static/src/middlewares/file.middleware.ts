import { FileOptions } from "../options";
import { BaseMiddleware } from "./base.middleware";
import { normalizePath } from "@ipare/core";

export class FileMiddleware extends BaseMiddleware {
  constructor(readonly options: FileOptions) {
    super();
  }

  async invoke(): Promise<void> {
    if (this.options.use405 && this.isPathEqual && !this.isMethodValid) {
      return this.setMethodNotAllowed();
    }

    if (
      !this.isMethodValid ||
      !this.isPathEqual ||
      !this.isFile(this.options.file)
    ) {
      return await this.next();
    }

    this.setFileResult(this.options.file);
  }

  private get isPathEqual() {
    return (
      normalizePath(this.ctx.req.path) ==
      normalizePath(this.options.reqPath ?? this.options.file)
    );
  }
}
