import * as fs from "fs";
import * as mime from "mime";
import { FileOptions } from "../options";
import { BaseMiddleware } from "./base.middleware";
import { normalizePath } from "@ipare/core";

export class FileMiddleware extends BaseMiddleware {
  constructor(readonly options: FileOptions) {
    super();
  }

  async invoke(): Promise<void> {
    if (!this.isReqValidated) {
      await this.next();
      return;
    }

    if (
      normalizePath(this.ctx.req.path) !=
      normalizePath(this.options.reqPath ?? this.options.file)
    ) {
      await this.next();
      return;
    }

    if (
      fs.existsSync(this.options.file) &&
      fs.statSync(this.options.file).isFile()
    ) {
      this.ok(
        fs.readFileSync(this.options.file, this.options.encoding)
      ).setHeader("content-type", mime.getType(this.options.file) || "*/*");
      this.setFile(this.options.file);
      return;
    }

    await this.next();
  }
}
