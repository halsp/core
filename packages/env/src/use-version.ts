import { Startup } from "@ipare/core";
import path from "path";
import * as fs from "fs";

export function useVersion<T extends Startup>(
  startup: T,
  header: string,
  cwd: string
): T {
  return startup.use(async (ctx, next) => {
    const pkgStr = await fs.promises.readFile(
      path.join(cwd, "package.json"),
      "utf-8"
    );
    const version = JSON.parse(pkgStr).version ?? "0";
    ctx.setHeader(header, version);
    await next();
  });
}
