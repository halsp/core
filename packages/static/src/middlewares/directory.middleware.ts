import * as path from "path";
import { DirectoryOptions } from "../options";
import { BaseMiddleware } from "./base.middleware";
import { normalizePath } from "@ipare/core";
import glob from "glob";
import * as fs from "fs";

type FilePathStats = { path: string; stats: fs.Stats };

export class DirectoryMiddleware extends BaseMiddleware {
  constructor(readonly options: DirectoryOptions) {
    super();
  }

  async invoke(): Promise<void> {
    if (this.options.use405 && !this.isMethodValid) {
      if ((await this.getFileInfo()) || (await this.getFileIndexInfo())) {
        return this.setMethodNotAllowed();
      } else {
        return await this.next();
      }
    }

    if (!this.isMethodValid) {
      return await this.next();
    }

    const fileInfo = await this.getFileInfo();
    if (fileInfo) {
      return this.setFileResult(fileInfo.path, fileInfo.stats);
    }

    const fileIndexInfo = await this.getFileIndexInfo();
    if (fileIndexInfo) {
      return this.setFileResult(fileIndexInfo.path, fileIndexInfo.stats);
    }

    const file404Info = await this.getFile404Info();
    if (file404Info) {
      return this.setFileResult(file404Info.path, file404Info.stats, true);
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

  async getFileInfo(): Promise<FilePathStats | undefined> {
    const filePath = this.getFilePath();
    if (!filePath) return;

    if (!this.isIgnore(filePath)) {
      return await this.createFileStats(filePath);
    }
  }

  async getFileIndexInfo(): Promise<FilePathStats | undefined> {
    if (!this.options.fileIndex) return;

    const filePath = this.getFilePath();
    if (!filePath) return;

    const indexFilePath = path.resolve(
      filePath,
      typeof this.options.fileIndex == "string"
        ? this.options.fileIndex
        : "index.html"
    );
    return await this.createFileStats(indexFilePath);
  }

  async getFile404Info(): Promise<FilePathStats | undefined> {
    if (!this.options.file404) return;

    const filePath = path.resolve(
      this.options.dir,
      this.options.file404 == true
        ? "404.html"
        : (this.options.file404 as string)
    );
    return await this.createFileStats(filePath);
  }

  getFilePath(): string | undefined {
    if (this.prefix && !this.ctx.req.path.startsWith(this.prefix)) {
      return;
    }

    let reqPath = this.ctx.req.path;
    if (this.prefix) {
      reqPath = reqPath.substring(this.prefix.length, reqPath.length);
    }
    reqPath = normalizePath(reqPath);

    return path.resolve(this.options.dir, reqPath);
  }

  async createFileStats(filePath: string): Promise<FilePathStats | undefined> {
    const stats = await this.getFileStats(filePath);
    if (!!stats?.isFile()) {
      return {
        stats,
        path: filePath,
      };
    }
  }
}
