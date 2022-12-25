import * as path from "path";
import { DirectoryOptions, FileOptions } from "../options";
import {
  ComposeMiddleware,
  isUndefined,
  Middleware,
  normalizePath,
} from "@ipare/core";
import * as fs from "fs";
import { MATCH_RESULT_BAG, IS_METHOD_VALID_BAG } from "../constant";
import { isIgnore } from "./utils";

export type MatchResult = {
  filePath: string;
  stats: fs.Stats;
};

abstract class BaseMatchMiddleware extends Middleware {
  constructor(readonly options: FileOptions | DirectoryOptions) {
    super();
  }

  private get isMethodValid() {
    return this.ctx.bag<boolean>(IS_METHOD_VALID_BAG);
  }

  protected get isEnable() {
    return !this.options.strictMethod || this.isMethodValid;
  }
}

class FileMatchMiddleware extends BaseMatchMiddleware {
  constructor(readonly options: FileOptions) {
    super(options);
  }

  async invoke(): Promise<void> {
    if (this.isEnable) {
      await this.matchFile();
    }

    await this.next();
  }

  private async matchFile() {
    if (!fs.existsSync(path.resolve(this.options.file))) {
      return;
    }

    if (!this.isPathEqual) {
      return;
    }

    const stats = await fs.promises.stat(this.options.file);
    if (!stats.isFile()) {
      return;
    }
    this.ctx.bag<MatchResult>(MATCH_RESULT_BAG, {
      filePath: this.options.file,
      stats: stats,
    });
  }

  private get isPathEqual() {
    return this.reqPaths.some((rp) => this.ctx.req.path == normalizePath(rp));
  }

  private get reqPaths() {
    const reqPaths: string[] = [];
    if (!isUndefined(this.options.reqPath)) {
      if (Array.isArray(this.options.reqPath)) {
        reqPaths.push(...this.options.reqPath);
      } else {
        reqPaths.push(this.options.reqPath);
      }
    } else {
      reqPaths.push(this.options.file);
    }
    return reqPaths;
  }
}

class DirectoryMatchMiddleware extends BaseMatchMiddleware {
  constructor(readonly options: DirectoryOptions) {
    super(options);
  }

  async invoke(): Promise<void> {
    if (this.isEnable) {
      await this.matchDirectory();
    }

    await this.next();
  }

  private async matchDirectory() {
    const options = this.options;
    const filePath = this.getDirFilePath();
    if (!filePath) return;

    const paths = [filePath];
    if (options.useIndex) {
      const indexFilePath = path.resolve(
        filePath,
        typeof options.useIndex == "string" ? options.useIndex : "index.html"
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

    if (isIgnore(filePath, this.options)) {
      return;
    }

    const stats = await fs.promises.stat(filePath);
    return {
      stats,
      filePath: filePath,
    };
  }

  private getDirFilePath(): string | undefined {
    const prefix = normalizePath(this.options.prefix);

    if (prefix && !this.ctx.req.path.startsWith(prefix)) {
      return;
    }

    let reqPath = this.ctx.req.path;
    if (prefix) {
      reqPath = reqPath.substring(prefix.length, reqPath.length);
    }
    reqPath = normalizePath(reqPath);

    return path.resolve(this.options.dir, reqPath);
  }
}

export class MatchMiddleware extends ComposeMiddleware {
  constructor(options: FileOptions | DirectoryOptions) {
    super();
    if ("file" in options) {
      this.add(() => new FileMatchMiddleware(options));
    } else {
      this.add(() => new DirectoryMatchMiddleware(options));
    }
  }
}
