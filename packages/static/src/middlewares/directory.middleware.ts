import * as path from "path";
import { DirectoryOptions } from "../options";
import { BaseMiddleware } from "./base.middleware";
import { normalizePath } from "@ipare/core";

export class DirectoryMiddleware extends BaseMiddleware {
  constructor(readonly options: DirectoryOptions) {
    super();
  }

  async invoke(): Promise<void> {
    if (this.options.use405 && !this.isMethodValid) {
      const filePath = this.filePath;
      if (filePath) {
        return this.setMethodNotAllowed();
      } else {
        return await this.next();
      }
    }

    if (!this.isMethodValid) {
      return await this.next();
    }

    const filePath = this.filePath;
    if (filePath) {
      return this.setFileResult(filePath);
    }

    if (this.options.file404) {
      const file404Path = this.file404Path;
      if (file404Path) {
        return this.setFileResult(file404Path, true);
      }
    }

    await this.next();
  }

  private get prefix() {
    return normalizePath(this.options.prefix);
  }

  get filePath(): string | undefined {
    if (this.prefix && !this.ctx.req.path.startsWith(this.prefix)) {
      return;
    }

    let reqPath = this.ctx.req.path;
    if (this.prefix) {
      reqPath = reqPath.substring(this.prefix.length, reqPath.length);
    }
    reqPath = normalizePath(reqPath);

    const reqFilePath = path.resolve(this.options.dir, reqPath);
    let filePath = reqFilePath;
    if (this.isFile(filePath)) {
      return filePath;
    }

    if (this.options.fileIndex) {
      filePath = path.resolve(
        reqFilePath,
        typeof this.options.fileIndex == "string"
          ? this.options.fileIndex
          : "index.html"
      );
      if (this.isFile(filePath)) {
        return filePath;
      }
    }

    return;
  }

  get file404Path(): string | undefined {
    const filePath = path.resolve(
      this.options.dir,
      this.options.file404 == true
        ? "404.html"
        : (this.options.file404 as string)
    );
    return this.isFile(filePath) ? filePath : undefined;
  }
}
