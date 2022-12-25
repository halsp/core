import { IS_METHOD_VALID_BAG, MATCH_RESULT_BAG } from "../constant";
import { FileOptions } from "../options";
import { BaseMiddleware } from "./base.middleware";
import { MatchResult } from "./match.middleware";

export class FileMiddleware extends BaseMiddleware {
  constructor(readonly options: FileOptions) {
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

    return await this.setFileResult(
      this.matchResult.filePath,
      this.matchResult.stats
    );
  }
}
