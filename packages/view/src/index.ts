import "sfa";
import { Startup, HttpContext, Middleware, Response } from "sfa";
import * as consolidate from "consolidate";
import * as path from "path";
import * as fs from "fs";

type RendererInterface = typeof consolidate.ejs;

interface ViewsConfig {
  options?: Record<string, unknown>;
  engines?: Record<string, RendererInterface | string>;
}

declare module "sfa" {
  interface Startup {
    useViews<T extends this>(dir?: string, cfg?: ViewsConfig): T;
  }

  interface HttpContext {
    view(tmpPath?: string, locals?: Record<string, unknown>): Promise<Response>;
    state: Record<string, unknown>;
  }

  interface Middleware {
    view(tmpPath?: string, locals?: Record<string, unknown>): Promise<Response>;
  }
}

Startup.prototype.useViews = function <T extends Startup>(
  dir = "views",
  cfg = <ViewsConfig>{
    engines: {},
    options: {},
  }
): T {
  Middleware.prototype.view = async function (
    tmpPath = "",
    locals: Record<string, unknown> = {}
  ) {
    return await render(this.ctx, dir, tmpPath, locals, cfg);
  };

  HttpContext.prototype.view = async function (
    tmpPath = "",
    locals: Record<string, unknown> = {}
  ) {
    return await render(this, dir, tmpPath, locals, cfg);
  };

  this.use(async (ctx, next) => {
    ctx.state = {};
    ctx.res.setHeader("sfa-views", "https://github.com/sfajs/views");
    await next();
  });

  return this as T;
};

async function render(
  ctx: HttpContext,
  dir: string,
  tmpPath: string,
  locals: Record<string, unknown>,
  cfg: ViewsConfig
): Promise<Response> {
  tmpPath = path.join(dir ?? "", tmpPath ?? "");
  const options = Object.assign(
    cfg.options ?? {},
    ctx.state ?? {},
    locals ?? {}
  );
  const file = getFile(tmpPath, cfg.engines ?? {});
  if (!file) return ctx.res;

  if (file.ext == "html") {
    ctx.ok(fs.readFileSync(file.filePath, "utf-8"));
    ctx.res.setHeader("content-type", "text/html");
  }

  const engine = getEngine(file.ext, cfg.engines ?? {});
  if (engine) {
    ctx.ok(await engine(file.filePath, options));
    ctx.res.setHeader("content-type", "text/html");
  }
  return ctx.res;
}

function getFile(
  tmpPath: string,
  engines: Record<string, RendererInterface | string>
): { filePath: string; ext: string } | undefined {
  tmpPath = tmpPath.replace(/\\/g, "/");
  const ext = getExt(tmpPath);
  if (ext) {
    return { ext, filePath: tmpPath };
  }

  let file = findFile(path.join(tmpPath, "index"), engines);
  if (!file) {
    file = findFile(tmpPath, engines);
  }
  return file;
}

function findFile(
  tmpPath: string,
  engines: Record<string, RendererInterface | string>
): { filePath: string; ext: string } | undefined {
  tmpPath = tmpPath.replace(/\\/g, "/");
  if (!tmpPath.includes("/")) {
    return { ext: tmpPath, filePath: tmpPath };
  }
  const dirIndex = tmpPath.lastIndexOf("/");
  const dir = tmpPath.substr(0, dirIndex);
  const fileName = tmpPath.substr(dirIndex + 1, tmpPath.length - dirIndex - 1);

  if (!fs.existsSync(dir) || fs.statSync(dir).isFile()) return;
  const files = fs.readdirSync(dir).filter((file) => file.startsWith(fileName));
  if (!files.length) return;
  if (files.length == 1) {
    const ext = getExt(files[0]);
    if (ext) {
      return {
        ext: ext,
        filePath: `${dir}/${fileName}.${ext}`,
      };
    }
  }

  for (const file of files) {
    const ext = getExt(file);
    if (!ext) continue;

    if (
      ext == "html" ||
      Object.keys(engines).includes(ext) ||
      Object.keys(consolidate).includes(ext)
    ) {
      return {
        ext: ext,
        filePath: `${dir}/${fileName}.${ext}`,
      };
    }
  }
}

function getExt(filePath: string): string | undefined {
  if (!filePath || !filePath.includes(".")) return;

  const index = filePath.lastIndexOf(".");
  const ext = filePath.substr(index + 1, filePath.length - index - 1);
  if (!ext.includes("/")) return ext;
}

function getEngine(
  ext: string,
  engines: Record<string, RendererInterface | string>
): RendererInterface | undefined {
  let engine;
  if (Object.keys(engines).includes(ext)) {
    engine = engines[ext];
    if (typeof engine == "string") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      engine = (consolidate as any)[engine];
    }
  } else if (Object.keys(consolidate).includes(ext)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine = (consolidate as any)[ext];
  }
  return engine;
}

export { consolidate, ViewsConfig, RendererInterface };
