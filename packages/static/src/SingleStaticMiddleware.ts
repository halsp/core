import * as fs from "fs";
import * as mime from "mime";
import { SingleStaticConfig } from "./StaticConfig";
import { BaseMiddleware } from "./BaseMiddleware";

export default class SingleStaticMiddleware extends BaseMiddleware {
  constructor(readonly cfg: SingleStaticConfig) {
    super();
  }

  async invoke(): Promise<void> {
    if (!this.isReqValida) {
      await this.next();
      return;
    }

    if (
      this.trimPath(this.ctx.req.path ?? "") !=
      this.trimPath(this.cfg.reqPath || (this.ctx.req.path ?? ""))
    ) {
      await this.next();
      return;
    }

    if (fs.existsSync(this.cfg.file)) {
      if (fs.statSync(this.cfg.file).isFile()) {
        this.ok(fs.readFileSync(this.cfg.file, this.cfg.encoding)).setHeader(
          "content-type",
          mime.getType(this.cfg.file) || "*/*"
        );
      } else {
        this.errRequestMsg({
          message: "illegal operation on a directory, read",
        });
      }
    } else {
      this.notFound();
    }
  }
}
