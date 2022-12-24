import { Middleware } from "@ipare/core";
import { HttpMethods } from "@ipare/methods";
import { FILE_ERROR_STATUS_BAG, FILE_BAG, DIR_RESULT_BAG } from "../constant";
import { FileOptions, DirectoryOptions } from "../options";
import * as fs from "fs";
import * as mime from "mime";
import path from "path";

export type FilePathStats = { path: string; stats: fs.Stats };

export abstract class BaseMiddleware extends Middleware {
  readonly options!: FileOptions | DirectoryOptions;

  protected get allowMethods() {
    const methods: string[] = [];
    if (!this.options.method?.length) {
      methods.push(HttpMethods.get, HttpMethods.head);
    } else if (Array.isArray(this.options.method)) {
      methods.push(...this.options.method);
    } else {
      methods.push(this.options.method);
    }
    return methods.map((m) => m.toUpperCase());
  }

  protected get isMethodValid(): boolean {
    const allowMethods = this.allowMethods;
    return (
      allowMethods.includes(HttpMethods.any) ||
      allowMethods.includes(this.ctx.req.method)
    );
  }

  protected async setFileResult(
    filePath: string,
    stats: fs.Stats,
    args: {
      status?: number;
      dirHtml?: string;
      error?: string;
    } = {}
  ) {
    const mimeType = mime.getType(filePath) || "*/*";
    this.ctx.res
      .setStatus(args.status || 200)
      .set("content-type", mimeType)
      .set("accept-ranges", "bytes")
      .set("last-modified", stats.mtime.toUTCString());

    this.ctx.bag(FILE_BAG, filePath);
    if (!args.status || args.status == 200) {
      if (args.dirHtml) {
        this.ctx.res.setBody(args.dirHtml);
        this.ctx.bag(DIR_RESULT_BAG, true);
      } else {
        const stream = fs.createReadStream(filePath, this.options.encoding);
        this.ctx.res.setBody(stream);
      }
    } else {
      if (args.error) {
        const html = await this.createErrorHtml(
          args.status,
          args.error,
          filePath
        );
        this.ctx.res.setBody(html);
      } else {
        const stream = fs.createReadStream(filePath, this.options.encoding);
        this.ctx.res.setBody(stream);
      }
      this.ctx.bag(FILE_ERROR_STATUS_BAG, args.status);
    }
  }

  private async createErrorHtml(
    status: number,
    message: string,
    tempPath: string
  ) {
    const html = await fs.promises.readFile(tempPath, "utf-8");
    return html
      .replace("{{ERROR_MESSAGE}}", message)
      .replace("{{ERROR_STATUS}}", status.toString());
  }

  protected async getFileStats(
    filePath: string,
    allowDir = false
  ): Promise<FilePathStats | undefined> {
    if (!fs.existsSync(filePath)) {
      return;
    }
    const stats = await fs.promises.stat(filePath);
    if (allowDir || stats.isFile()) {
      return {
        stats,
        path: filePath,
      };
    }
  }

  private async getErrorStats(
    error: string
  ): Promise<(FilePathStats & { error?: string }) | undefined> {
    const filePath = path.join(__dirname, "../../html/error.html");
    const stats = await this.getFileStats(filePath);
    return {
      ...(stats as FilePathStats),
      error,
    };
  }

  protected async get404Stats() {
    return await this.getErrorStats("The requested path could not be found");
  }

  protected async get405Stats() {
    return await this.getErrorStats("Method not allowed");
  }
}
