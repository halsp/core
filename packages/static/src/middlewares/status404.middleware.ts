import * as path from "path";
import { DirectoryOptions, FileOptions } from "../options";
import { BaseMiddleware } from "./base.middleware";
import * as fs from "fs";
import { MatchResult } from "./match.middleware";

export class Status404Middleware extends BaseMiddleware {
  constructor(readonly options: DirectoryOptions | FileOptions) {
    super();
  }

  async invoke(): Promise<void> {
    const file404Info = await this.getFile404Info();
    await this.setFileResult(file404Info.filePath, file404Info.stats, {
      status: 404,
      error: file404Info.error,
    });
  }

  private get file404() {
    return this.options.file404 as string | true;
  }

  private async getFile404Info(): Promise<MatchResult & { error?: string }> {
    async function getFileInfo(
      filePath: string
    ): Promise<MatchResult | undefined> {
      if (fs.existsSync(filePath)) {
        const stats = await fs.promises.stat(filePath);
        if (stats.isFile()) {
          return {
            stats,
            filePath,
          };
        }
      }
    }
    if (this.file404 == true) {
      if ("dir" in this.options) {
        const filePath = path.resolve(this.options.dir, "404.html");
        const fileInfo = await getFileInfo(filePath);
        if (fileInfo) {
          return fileInfo;
        }
      }
    } else {
      const filePath = path.resolve(
        this.options["dir"] ?? process.cwd(),
        this.file404
      );
      const fileInfo = await getFileInfo(filePath);
      if (fileInfo) {
        return fileInfo;
      }
    }

    return await this.getErrorStats("The requested path could not be found");
  }
}
