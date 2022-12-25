import * as path from "path";
import { DirectoryOptions, FileOptions } from "../options";
import { BaseMiddleware } from "./base.middleware";
import { isUndefined, normalizePath } from "@ipare/core";
import * as fs from "fs";
import { MATCH_RESULT_BAG, IS_METHOD_VALID_BAG } from "../constant";
import { isIgnore } from "./utils";

export type MatchResult = {
  filePath: string;
  stats: fs.Stats;
};

export class MatchMiddleware extends BaseMiddleware {
  constructor(readonly options: DirectoryOptions | FileOptions) {
    super();
  }

  private get isMethodValid() {
    return this.ctx.bag<boolean>(IS_METHOD_VALID_BAG);
  }

  private getOptions<T extends DirectoryOptions | FileOptions>() {
    return this.options as T;
  }

  async invoke(): Promise<void> {
    if (this.options.generic405 && !this.isMethodValid) {
      return await this.next();
    }

    if ("file" in this.options) {
      await this.matchFile();
    } else {
      await this.matchDirectory();
    }
    await this.next();
  }

  private async matchFile() {
    const options = this.getOptions<FileOptions>();
    if (!fs.existsSync(path.resolve(options.file))) {
      return;
    }

    const reqPath: string[] = [];
    if (!isUndefined(options.reqPath)) {
      if (Array.isArray(options.reqPath)) {
        reqPath.push(...options.reqPath);
      } else {
        reqPath.push(options.reqPath);
      }
    } else {
      reqPath.push(options.file);
    }

    const isExist = reqPath.some(
      (item) => this.ctx.req.path == normalizePath(item)
    );
    if (!isExist) {
      return;
    }

    const stats = await fs.promises.stat(options.file);
    if (!stats.isFile()) {
      return;
    }
    this.ctx.bag<MatchResult>(MATCH_RESULT_BAG, {
      filePath: options.file,
      stats: stats,
    });
  }

  private async matchDirectory() {
    const options = this.getOptions<DirectoryOptions>();

    const filePath = this.getDirFilePath();
    if (!filePath) return;

    const paths = [filePath];
    if (options.fileIndex) {
      const indexFilePath = path.resolve(
        filePath,
        typeof options.fileIndex == "string" ? options.fileIndex : "index.html"
      );
      paths.push(indexFilePath);
    }

    let defaultFileInfo: MatchResult | undefined = undefined;
    for (const pathItem of paths) {
      const fileInfo = await this.tryGetDirFileInfo(pathItem);
      if (pathItem == filePath) {
        defaultFileInfo = fileInfo;
      }
      if (fileInfo && fileInfo.stats.isFile()) {
        this.ctx.bag(MATCH_RESULT_BAG, fileInfo);
        return;
      }
    }

    if (defaultFileInfo?.stats?.isDirectory()) {
      this.ctx.bag(MATCH_RESULT_BAG, defaultFileInfo);
    }
  }

  private async tryGetDirFileInfo(
    filePath: string
  ): Promise<MatchResult | undefined> {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const options = this.getOptions<DirectoryOptions>();
    if (isIgnore(filePath, options)) {
      return;
    }

    const stats = await fs.promises.stat(filePath);
    return {
      stats,
      filePath: filePath,
    };
  }

  private getDirFilePath(): string | undefined {
    const options = this.getOptions<DirectoryOptions>();
    const prefix = normalizePath(options.prefix);

    if (prefix && !this.ctx.req.path.startsWith(prefix)) {
      return;
    }

    let reqPath = this.ctx.req.path;
    if (prefix) {
      reqPath = reqPath.substring(prefix.length, reqPath.length);
    }
    reqPath = normalizePath(reqPath);

    return path.resolve(options.dir, reqPath);
  }
}
