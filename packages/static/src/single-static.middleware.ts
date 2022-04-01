import * as fs from "fs";
import * as mime from "mime";
import { SingleStaticConfig } from "./static-config";
import { BaseMiddleware } from "./base.middleware";
import { normalizePath } from "@sfajs/core";

export class SingleStaticMiddleware extends BaseMiddleware {
  constructor(readonly cfg: SingleStaticConfig) {
    super();
  }

  async invoke(): Promise<void> {
    if (!this.isReqValida) {
      await this.next();
      return;
    }

    if (
      normalizePath(this.ctx.req.path) !=
      normalizePath(this.cfg.reqPath ?? this.cfg.file)
    ) {
      await this.next();
      return;
    }

    if (fs.existsSync(this.cfg.file) && fs.statSync(this.cfg.file).isFile()) {
      this.ok(fs.readFileSync(this.cfg.file, this.cfg.encoding)).setHeader(
        "content-type",
        mime.getType(this.cfg.file) || "*/*"
      );
      this.setFile(this.cfg.file);
      return;
    }

    await this.next();
  }
}
