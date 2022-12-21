import * as path from "path";
import { DirectoryOptions } from "../options";
import { BaseMiddleware } from "./base.middleware";
import { normalizePath } from "@ipare/core";
import glob from "glob";

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

  private isIgnore(filePath: string) {
    const excludePaths: string[] = [];
    const excludeArr: string[] = [];
    if (Array.isArray(this.options.exclude)) {
      excludeArr.push(...this.options.exclude.filter((item) => !!item));
    } else if (this.options.exclude) {
      excludeArr.push(this.options.exclude);
    }
    excludeArr.forEach((item) => {
      if (glob.hasMagic(item)) {
        const paths = glob.sync(item, {
          cwd: path.resolve(this.options.dir),
        });
        excludePaths.push(...paths);
      } else {
        excludePaths.push(item);
      }
    });

    return excludePaths.some((item) => {
      const exPath = path.resolve(this.options.dir, item);
      return exPath == filePath || filePath.startsWith(exPath + path.sep);
    });
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

    const filePath = path.resolve(this.options.dir, reqPath);
    if (!this.isIgnore(filePath) && this.isFile(filePath)) {
      return filePath;
    }

    if (this.options.fileIndex) {
      const indexFilePath = path.resolve(
        filePath,
        typeof this.options.fileIndex == "string"
          ? this.options.fileIndex
          : "index.html"
      );
      if (this.isFile(indexFilePath)) {
        return indexFilePath;
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
