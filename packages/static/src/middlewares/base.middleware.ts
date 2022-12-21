import { Middleware } from "@ipare/core";
import { HttpMethods } from "@ipare/methods";
import { FILE_404_BAG, FILE_BAG } from "../constant";
import { FileOptions, DirectoryOptions } from "../options";
import * as fs from "fs";
import * as mime from "mime";

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

  protected setMethodNotAllowed() {
    this.methodNotAllowed().set("Allow", this.allowMethods);
  }

  protected setFileResult(filePath: string, stats: fs.Stats, is404 = false) {
    const stream = fs.createReadStream(filePath, this.options.encoding);
    const mimeType = mime.getType(filePath) || "*/*";
    this.ctx.res
      .setBody(stream)
      .setStatus(is404 ? 404 : 200)
      .set("content-type", mimeType)
      .set("accept-ranges", "bytes")
      .set("last-modified", stats.mtime.toUTCString());

    this.ctx.bag(FILE_BAG, filePath);
    if (is404) {
      this.ctx.bag(FILE_404_BAG, true);
    }
  }

  protected async getFileStats(
    filePath: string
  ): Promise<fs.Stats | undefined> {
    if (fs.existsSync(filePath)) {
      return await fs.promises.stat(filePath);
    }
  }
}
