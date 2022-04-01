import * as path from "path";
import * as fs from "fs";
import * as mime from "mime";
import { StaticConfig } from "./static-config";
import { BaseMiddleware } from "./base.middleware";

export default class StaticMiddleware extends BaseMiddleware {
  constructor(readonly cfg: StaticConfig) {
    super();
  }

  async invoke(): Promise<void> {
    if (!this.isReqValida) {
      await this.next();
      return;
    }

    if (
      !this.cfg.prefix ||
      (this.ctx.req.path ?? "")
        .toUpperCase()
        .startsWith(this.cfg.prefix.toUpperCase())
    ) {
      const filePath = this.filePath;
      if (filePath) {
        this.ok(fs.readFileSync(filePath, this.cfg.encoding)).setHeader(
          "content-type",
          mime.getType(filePath) || "*/*"
        );
        this.setFile(filePath);
        return;
      }
    }

    if (this.cfg.file404) {
      const file404Path = this.file404Path;
      if (file404Path) {
        this.notFound(
          fs.readFileSync(file404Path, this.cfg.encoding)
        ).setHeader("content-type", mime.getType(file404Path) || "*/*");
        this.setFile(file404Path, true);
        return;
      }
    }

    await this.next();
  }

  get filePath(): string | undefined {
    let reqPath = this.trimPath(this.ctx.req.path ?? "");
    if (this.cfg.prefix) {
      reqPath = reqPath.substr(
        this.cfg.prefix.length,
        reqPath.length - this.cfg.prefix.length
      );
    }

    const reqFilePath = path.join(this.cfg.dir, reqPath);
    let filePath = reqFilePath;
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      return filePath;
    }

    filePath = path.join(reqFilePath, "index.html");
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      return filePath;
    }

    return;
  }

  get file404Path(): string | undefined {
    const filePath = path.join(
      this.cfg.dir,
      this.cfg.file404 == true ? "404.html" : (this.cfg.file404 as string)
    );
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      return filePath;
    }

    return;
  }
}
