import path from "path";
import * as fs from "fs";

export async function getVersion(
  cwd = process.cwd()
): Promise<string | undefined> {
  let pkgPath = "package.json";
  while (true) {
    const absolutePath = path.join(cwd, pkgPath);
    if (fs.existsSync(absolutePath)) {
      const pkgStr = await fs.promises.readFile(absolutePath, "utf-8");
      return JSON.parse(pkgStr).version;
    } else {
      pkgPath = path.join("..", pkgPath);
      if (path.resolve(absolutePath) == path.resolve(cwd, pkgPath)) {
        break;
      }
    }
  }
}
