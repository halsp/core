import { ComposeMiddleware } from "@ipare/core";
import path from "path";
import { IS_METHOD_VALID_BAG, MATCH_RESULT_BAG } from "../constant";
import { DirectoryOptions, FileOptions } from "../options";
import { BaseMiddleware } from "./base.middleware";
import { MatchResult } from "./match.middleware";
import { createDirHtml } from "./utils";

abstract class BaseResultMiddleware extends BaseMiddleware {
  constructor(readonly options: FileOptions | DirectoryOptions) {
    super();
  }

  protected get matchResult() {
    return this.ctx.bag<MatchResult>(MATCH_RESULT_BAG);
  }
  private get isMethodValid() {
    return this.ctx.bag<boolean>(IS_METHOD_VALID_BAG);
  }

  protected get isEnable() {
    return !!this.matchResult && this.isMethodValid;
  }
}

class DirectoryResultMiddleware extends BaseResultMiddleware {
  constructor(readonly options: DirectoryOptions) {
    super(options);
  }

  async invoke(): Promise<void> {
    if (!this.isEnable) {
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

class FileResultMiddleware extends BaseResultMiddleware {
  constructor(readonly options: FileOptions) {
    super(options);
  }

  async invoke(): Promise<void> {
    if (!this.isEnable) {
      return await this.next();
    }

    return await this.setFileResult(
      this.matchResult.filePath,
      this.matchResult.stats
    );
  }
}

export class ResultMiddleware extends ComposeMiddleware {
  constructor(readonly options: FileOptions | DirectoryOptions) {
    super();
    if ("file" in options) {
      this.add(() => new FileResultMiddleware(options));
    } else {
      this.add(() => new DirectoryResultMiddleware(options));
    }
  }
}
