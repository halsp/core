import { Middleware } from "@halsp/core";
import { FILE_ERROR_STATUS_BAG, FILE_BAG, DIR_RESULT_BAG } from "../constant";
import { FileOptions, DirectoryOptions } from "../options";
import fs from "fs";
import mime from "mime";
import path from "path";
import { MatchResult } from "./match.middleware";

export abstract class BaseMiddleware extends Middleware {
  readonly options!: FileOptions | DirectoryOptions;

  protected async setFileResult(
    filePath: string,
    stats: fs.Stats,
    args: {
      status?: number;
      dirHtml?: string;
      error?: string;
    } = {},
  ) {
    const mimeType = mime.getType(filePath) || "*/*";
    this.ctx.res
      .setStatus(args.status || 200)
      .set("content-type", mimeType)
      .set("accept-ranges", "bytes")
      .set("last-modified", stats.mtime.toUTCString());

    this.ctx.set(FILE_BAG, filePath);
    if (!args.status || args.status == 200) {
      if (args.dirHtml) {
        this.ctx.res.setBody(args.dirHtml);
        this.ctx.set(DIR_RESULT_BAG, true);
      } else {
        const stream = fs.createReadStream(filePath, this.options.encoding);
        this.ctx.res.setBody(stream);
      }
    } else {
      if (args.error) {
        const html = await this.createErrorHtml(
          args.status,
          args.error,
          filePath,
        );
        this.ctx.res.setBody(html);
      } else {
        const stream = fs.createReadStream(filePath, this.options.encoding);
        this.ctx.res.setBody(stream);
      }
      this.ctx.set(FILE_ERROR_STATUS_BAG, args.status);
    }
  }

  private async createErrorHtml(
    status: number,
    message: string,
    tempPath: string,
  ) {
    const html = await fs.promises.readFile(tempPath, "utf-8");
    return html
      .replace("{{ERROR_MESSAGE}}", message)
      .replace("{{ERROR_STATUS}}", status.toString());
  }

  protected async getErrorStats(
    error: string,
  ): Promise<MatchResult & { error?: string }> {
    const filePath = path.join(__dirname, "../../html/error.html");
    const stats = await fs.promises.stat(filePath);
    return {
      stats,
      filePath,
      error,
    };
  }
}
