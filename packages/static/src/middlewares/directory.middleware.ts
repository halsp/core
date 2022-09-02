import * as path from "path";
import * as fs from "fs";
import * as mime from "mime";
import { DirectoryOptions } from "../options";
import { BaseMiddleware } from "./base.middleware";
import { normalizePath } from "@ipare/core";

export class DirectoryMiddleware extends BaseMiddleware {
  constructor(readonly options: DirectoryOptions) {
    super();
  }

  async invoke(): Promise<void> {
    if (!this.isReqValidated) {
      await this.next();
      return;
    }

    if (
      !this.options.prefix ||
      this.ctx.req.path
        .toUpperCase()
        .startsWith(this.options.prefix.toUpperCase())
    ) {
      const filePath = this.filePath;
      if (filePath) {
        this.ok(fs.readFileSync(filePath, this.options.encoding)).setHeader(
          "content-type",
          mime.getType(filePath) || "*/*"
        );
        this.setBagFile(filePath);
        return;
      }
    }

    if (this.options.file404) {
      const file404Path = this.file404Path;
      if (file404Path) {
        this.notFound(
          fs.readFileSync(file404Path, this.options.encoding)
        ).setHeader("content-type", mime.getType(file404Path) || "*/*");
        this.setBagFile(file404Path, true);
        return;
      }
    }

    await this.next();
  }

  get filePath(): string | undefined {
    let reqPath = normalizePath(this.ctx.req.path);
    if (this.options.prefix) {
      reqPath = reqPath.substring(this.options.prefix.length, reqPath.length);
    }

    const reqFilePath = path.join(this.options.dir, reqPath);
    let filePath = reqFilePath;
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      return filePath;
    }

    if (this.options.fileIndex) {
      filePath = path.join(
        reqFilePath,
        typeof this.options.fileIndex == "string"
          ? this.options.fileIndex
          : "index.html"
      );
      if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
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
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      return filePath;
    }

    return;
  }
}
