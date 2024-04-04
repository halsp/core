import { DirectoryOptions, FileOptions } from "../options";
import { BaseMiddleware } from "./base.middleware";
import path from "path";
import { IS_METHOD_VALID_BAG, MATCH_RESULT_BAG } from "../constant";
import fs from "fs";
import { MatchResult } from "./match.middleware";

export class Status405Middleware extends BaseMiddleware {
  constructor(readonly options: FileOptions | DirectoryOptions) {
    super();
  }

  private get matchResult() {
    return this.ctx.get<MatchResult | undefined>(MATCH_RESULT_BAG);
  }
  private get isMethodValid() {
    return this.ctx.get<boolean>(IS_METHOD_VALID_BAG);
  }
  private get use405() {
    return this.options.use405 as string | true;
  }

  async invoke(): Promise<void> {
    if (this.isMethodValid) {
      return await this.next();
    }
    if (!this.matchResult && !this.options.strictMethod) {
      return await this.next();
    }
    if (
      this.matchResult &&
      !this.options["listDir"] &&
      this.matchResult.stats.isDirectory()
    ) {
      return await this.next();
    }

    const file405Info = await this.getFile405Info();
    await this.setFileResult(file405Info.filePath, file405Info.stats, {
      status: 405,
      error: file405Info.error,
    });
  }

  private async getFile405Info(): Promise<MatchResult & { error?: string }> {
    if (this.use405 == true) {
      if ("dir" in this.options) {
        const filePath = path.resolve(this.options.dir, "405.html");
        if (fs.existsSync(filePath)) {
          return {
            filePath,
            stats: await fs.promises.stat(filePath),
          };
        }
      }
    } else {
      const filePath = path.resolve(
        this.options["dir"] ?? process.cwd(),
        this.use405,
      );
      if (fs.existsSync(filePath)) {
        return {
          filePath,
          stats: await fs.promises.stat(filePath),
        };
      }
    }

    return await this.getErrorStats("Method not allowed");
  }
}
