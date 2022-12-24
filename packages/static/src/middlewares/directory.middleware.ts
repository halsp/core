import * as path from "path";
import { DirectoryOptions } from "../options";
import { BaseMiddleware, FilePathStats } from "./base.middleware";
import { normalizePath } from "@ipare/core";
import glob from "glob";
import * as fs from "fs";

export class DirectoryMiddleware extends BaseMiddleware {
  constructor(readonly options: DirectoryOptions) {
    super();
  }

  async invoke(): Promise<void> {
    if (!this.isMethodValid) {
      const file405Info = await this.getFile405Info();
      if (file405Info) {
        return await this.setFileResult(file405Info.path, file405Info.stats, {
          status: 405,
          error: file405Info.error,
        });
      }
      return await this.next();
    }

    const fileInfo = await this.getFileInfo();
    if (fileInfo) {
      if (fileInfo.stats.isFile()) {
        return await this.setFileResult(fileInfo.path, fileInfo.stats);
      } else {
        if (this.options.listDir) {
          const tempPath = path.join(__dirname, "../../html/dir.html");
          return await this.setFileResult(tempPath, fileInfo.stats, {
            dirHtml: await this.createDirHtml(fileInfo.path, tempPath),
          });
        }
      }
    }

    const fileIndexInfo = await this.getFileIndexInfo();
    if (fileIndexInfo) {
      return await this.setFileResult(fileIndexInfo.path, fileIndexInfo.stats);
    }

    await this.next();
  }

  private get prefix() {
    return normalizePath(this.options.prefix);
  }

  private isIgnore(filePath: string) {
    const excludePaths: string[] = [];
    const excludeArr: string[] = [];
    if (Array.isArray(this.options.exclude)) {
      excludeArr.push(...this.options.exclude.filter((item) => !!item));
    } else if (this.options.exclude) {
      excludeArr.push(this.options.exclude);
    }
    excludeArr.forEach((item) => {
      if (glob.hasMagic(item)) {
        const paths = glob.sync(item, {
          cwd: path.resolve(this.options.dir),
        });
        excludePaths.push(...paths);
      } else {
        excludePaths.push(item);
      }
    });

    return excludePaths.some((item) => {
      const exPath = path.resolve(this.options.dir, item);
      return exPath == filePath || filePath.startsWith(exPath + path.sep);
    });
  }

  private async getFileInfo(): Promise<FilePathStats | undefined> {
    const filePath = this.getFilePath();
    if (!filePath) return;

    if (!this.isIgnore(filePath)) {
      return await this.getFileStats(filePath, true);
    }
  }

  private async getFileIndexInfo(): Promise<FilePathStats | undefined> {
    if (!this.options.fileIndex) return;

    const filePath = this.getFilePath();
    if (!filePath) return;

    const indexFilePath = path.resolve(
      filePath,
      typeof this.options.fileIndex == "string"
        ? this.options.fileIndex
        : "index.html"
    );
    return await this.getFileStats(indexFilePath);
  }

  private async getFile405Info(): Promise<
    (FilePathStats & { error?: string }) | undefined
  > {
    if (!this.options.file405) return;

    const fileInfo = await this.getFileInfo();
    if (
      (!fileInfo || (!this.options.listDir && fileInfo.stats.isDirectory())) &&
      !(await this.getFileIndexInfo())
    ) {
      return;
    }

    if (this.options.file405 == true) {
      const filePath = path.resolve(this.options.dir, "405.html");
      if (fs.existsSync(filePath)) {
        return await this.getFileStats(filePath);
      } else {
        return await this.get405Stats();
      }
    } else {
      const filePath = path.resolve(this.options.dir, this.options.file405);
      return await this.getFileStats(filePath);
    }
  }

  private getFilePath(): string | undefined {
    if (this.prefix && !this.ctx.req.path.startsWith(this.prefix)) {
      return;
    }

    let reqPath = this.ctx.req.path;
    if (this.prefix) {
      reqPath = reqPath.substring(this.prefix.length, reqPath.length);
    }
    reqPath = normalizePath(reqPath);

    return path.resolve(this.options.dir, reqPath);
  }

  private async createDirHtml(dir: string, tempPath: string) {
    const html = await fs.promises.readFile(tempPath, "utf-8");

    return html
      .replace("{{DIR_PATH}}", this.getRelativeDir(dir) + path.sep)
      .replace("{{DIR_PATHS}}", this.getDirPaths(dir))
      .replace("{{DIR_FILES}}", await this.getDirFiles(dir));
  }

  private getDirPaths(dir: string) {
    return this.getRelativeDir(dir)
      .split(path.sep)
      .map((item, index, parts) => {
        const dirPath = [...parts].splice(0, index + 1).join("/");
        const dirUrl = this.getRelativeDir(dirPath).replace("\\", "/");
        return {
          name: item,
          path: dirUrl,
        };
      })
      .map((item) => `<a href="/${item.path}">${item.name}${path.sep}</a>`)
      .join("");
  }

  private getRelativeDir(dir: string) {
    return path.relative(path.join(process.cwd(), this.options.dir), dir);
  }

  private async getDirFiles(dir: string) {
    const relativeDir = this.getRelativeDir(dir);
    const files = await fs.promises.readdir(dir);
    if (relativeDir) {
      files.splice(0, 0, "..");
    }

    return files
      .filter((item) => !this.isIgnore(path.join(dir, item)))
      .sort((left, right) => {
        const isLeftDir = fs.statSync(path.join(dir, left)).isDirectory();
        const isRightDir = fs.statSync(path.join(dir, right)).isDirectory();
        if (isLeftDir > isRightDir) {
          return -1;
        } else if (isLeftDir < isRightDir) {
          return 1;
        } else {
          return 0;
        }
      })
      .map((file) => {
        const ext = path.extname(file).replace(/^.+/, "");
        const name = path.basename(file);
        const relative = path.join(relativeDir, file).replace("\\", "/");
        const isDir = fs.statSync(path.join(dir, file)).isDirectory();
        const type = isDir ? "folder" : "file";

        return `<li>
      <a href="/${relative}" title="${file}" class="${type} ${ext}">${name}</a>
    </li>`;
      })
      .join("\n");
  }
}
