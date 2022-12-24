import { FileOptions } from "../options";
import { BaseMiddleware, FilePathStats } from "./base.middleware";
import { normalizePath } from "@ipare/core";
import path from "path";

export class FileMiddleware extends BaseMiddleware {
  constructor(readonly options: FileOptions) {
    super();
  }

  async invoke(): Promise<void> {
    if (!this.isMethodValid) {
      if (await this.getFileInfo()) {
        const file405Info = await this.getFile405Info();
        if (file405Info) {
          return await this.setFileResult(file405Info.path, file405Info.stats, {
            status: 405,
            error: file405Info.error,
          });
        }
      }
      return await this.next();
    }

    const fileInfo = await this.getFileInfo();
    if (fileInfo) {
      return await this.setFileResult(fileInfo.path, fileInfo.stats);
    }

    const file404Info = await this.getFile404Info();
    if (file404Info) {
      return await this.setFileResult(file404Info.path, file404Info.stats, {
        status: 404,
        error: file404Info.error,
      });
    }

    await this.next();
  }

  private async getFileInfo(): Promise<FilePathStats | undefined> {
    if (
      normalizePath(this.ctx.req.path) !=
      normalizePath(this.options.reqPath ?? this.options.file)
    ) {
      return;
    }

    const fileInfo = await this.getFileStats(this.options.file);
    if (fileInfo?.stats?.isFile()) {
      return fileInfo;
    }
  }

  private async getFile404Info(): Promise<
    (FilePathStats & { error?: string }) | undefined
  > {
    if (!this.options.file404) return;

    if (this.options.file404 == true) {
      return await this.get404Stats();
    } else {
      const filePath = path.resolve(this.options.file404);
      return await this.getFileStats(filePath);
    }
  }

  private async getFile405Info(): Promise<
    (FilePathStats & { error?: string }) | undefined
  > {
    if (!this.options.file405) return;

    if (this.options.file405 == true) {
      return await this.get405Stats();
    } else {
      const filePath = path.resolve(this.options.file405);
      return await this.getFileStats(filePath);
    }
  }
}
