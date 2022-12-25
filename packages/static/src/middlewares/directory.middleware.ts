import * as path from "path";
import { DirectoryOptions } from "../options";
import { BaseMiddleware } from "./base.middleware";
import { MatchResult } from "./match.middleware";
import { MATCH_RESULT_BAG, IS_METHOD_VALID_BAG } from "../constant";
import { createDirHtml } from "./utils";

export class DirectoryMiddleware extends BaseMiddleware {
  constructor(readonly options: DirectoryOptions) {
    super();
  }

  private get matchResult() {
    return this.ctx.bag<MatchResult | undefined>(MATCH_RESULT_BAG);
  }
  private get isMethodValid() {
    return this.ctx.bag<boolean>(IS_METHOD_VALID_BAG);
  }

  async invoke(): Promise<void> {
    if (!this.matchResult || !this.isMethodValid) {
      return await this.next();
    }

    if (this.matchResult.stats.isFile()) {
      return await this.setFileResult(
        this.matchResult.filePath,
        this.matchResult.stats
      );
    } else {
      if (this.options.listDir) {
        const tempPath = path.join(__dirname, "../../html/dir.html");
        return await this.setFileResult(tempPath, this.matchResult.stats, {
          dirHtml: await createDirHtml(
            this.matchResult.filePath,
            tempPath,
            this.options
          ),
        });
      } else {
        await this.next();
      }
    }
  }
}
