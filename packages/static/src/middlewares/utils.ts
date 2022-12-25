import glob from "glob";
import path from "path";
import { DirectoryOptions } from "../options";
import * as fs from "fs";

export function isIgnore(filePath: string, options: DirectoryOptions) {
  const excludePaths: string[] = [];
  const excludeArr: string[] = [];
  if (Array.isArray(options.exclude)) {
    excludeArr.push(...options.exclude.filter((item) => !!item));
  } else if (options.exclude) {
    excludeArr.push(options.exclude);
  }
  excludeArr.forEach((item) => {
    if (glob.hasMagic(item)) {
      const paths = glob.sync(item, {
        cwd: path.resolve(options.dir),
      });
      excludePaths.push(...paths);
    } else {
      excludePaths.push(item);
    }
  });

  return excludePaths.some((item) => {
    const exPath = path.resolve(options.dir, item);
    return exPath == filePath || filePath.startsWith(exPath + path.sep);
  });
}

export async function createDirHtml(
  dir: string,
  tempPath: string,
  options: DirectoryOptions
) {
  function getDirPaths(dir: string) {
    return getRelativeDir(dir)
      .split(path.sep)
      .map((item, index, parts) => {
        const dirPath = [...parts].splice(0, index + 1).join("/");
        const dirUrl = getRelativeDir(dirPath).replace("\\", "/");
        return {
          name: item,
          path: dirUrl,
        };
      })
      .map((item) => `<a href="/${item.path}">${item.name}${path.sep}</a>`)
      .join("");
  }

  function getRelativeDir(dir: string) {
    return path.relative(path.join(process.cwd(), options.dir), dir);
  }

  async function getDirFiles(dir: string) {
    const relativeDir = getRelativeDir(dir);
    const files = await fs.promises.readdir(dir);
    if (relativeDir) {
      files.splice(0, 0, "..");
    }

    return files
      .filter((item) => !isIgnore(path.join(dir, item), options))
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

  const html = await fs.promises.readFile(tempPath, "utf-8");

  return html
    .replace("{{DIR_PATH}}", getRelativeDir(dir) + path.sep)
    .replace("{{DIR_PATHS}}", getDirPaths(dir))
    .replace("{{DIR_FILES}}", await getDirFiles(dir));
}
