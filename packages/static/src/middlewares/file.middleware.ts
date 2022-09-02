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
    if (!this.isMethodValid) {
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
      const content = await fs.promises.readFile(
        this.options.file,
        this.options.encoding
      );
      this.setHeader(
        "content-type",
        mime.getType(this.options.file) || "*/*"
      ).ok(content);
      this.setBagFile(this.options.file);
      return;
    }

    await this.next();
  }
}
