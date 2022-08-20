import { isUndefined, Startup } from "@ipare/core";
import path from "path";
import * as fs from "fs";
import { VERSION } from "./constant";

export function useVersion(
  startup: Startup,
  header: string,
  cwd: string
): Startup {
  return startup.use(async (ctx, next) => {
    if (isUndefined(startup[VERSION])) {
      startup[VERSION] = (await getVersion(cwd)) ?? "0";
    }
    ctx.setHeader(header, startup[VERSION]);
    await next();
  });
}

export async function getVersion(
  cwd = process.cwd()
): Promise<string | undefined> {
  let pkgPath = "package.json";
  while (true) {
    const absolutePath = path.join(cwd, pkgPath);
    if (fs.existsSync(absolutePath)) {
      const pkgStr = await fs.promises.readFile(absolutePath, "utf-8");
      const version = JSON.parse(pkgStr).version ?? "0";
      return version;
    } else {
      pkgPath = path.join("..", pkgPath);
      if (path.resolve(absolutePath) == path.resolve(cwd, pkgPath)) {
        break;
      }
    }
  }
}
