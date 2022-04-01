import "@sfajs/core";
import { Startup, HttpContext, Middleware, SfaResponse } from "@sfajs/core";
import * as path from "path";
import * as fs from "fs";
import linq from "linq";
import {
  ViewsConfig,
  consolidate,
  Engine,
  RendererInterface,
} from "./views-config";

declare module "@sfajs/core" {
  interface Startup {
    useViews<T extends this>(cfg?: ViewsConfig): T;
  }

  interface HttpContext {
    view(
      tmpPath: string,
      locals?: Record<string, unknown>
    ): Promise<SfaResponse>;
    state: Record<string, unknown>;
  }

  interface Middleware {
    view(
      tmpPath: string,
      locals?: Record<string, unknown>
    ): Promise<SfaResponse>;
  }
}

Startup.prototype.useViews = function <T extends Startup>(
  cfg: ViewsConfig = {}
): T {
  Middleware.prototype.view = async function (
    tmpPath,
    locals: Record<string, unknown> = {}
  ) {
    return await render(this.ctx, cfg, tmpPath, locals);
  };

  HttpContext.prototype.view = async function (
    tmpPath,
    locals: Record<string, unknown> = {}
  ) {
    return await render(this, cfg, tmpPath, locals);
  };

  this.use(async (ctx, next) => {
    ctx.state = {};
    await next();
  });

  return this as T;
};

async function render(
  ctx: HttpContext,
  cfg: ViewsConfig,
  tmpPath: string,
  locals: Record<string, unknown>
): Promise<SfaResponse> {
  tmpPath = path.join(cfg.dir ?? "views", tmpPath ?? "");
  cfg.options = Object.assign(cfg.options ?? {}, ctx.state ?? {}, locals ?? {});
  let engines = cfg.engines ?? [];
  if (!Array.isArray(engines)) {
    engines = [engines];
  }

  const file = getFile(tmpPath, engines);
  if (!file) return ctx.res;

  if (file.ext == "html") {
    ctx.ok(fs.readFileSync(file.filePath, "utf-8"));
    ctx.res.setHeader("content-type", "text/html");
  }

  const engine = getEngine(file.ext, engines);
  if (engine) {
    ctx.ok(await engine(file.filePath, cfg.options));
    ctx.res.setHeader("content-type", "text/html");
  }
  return ctx.res;
}

function getFile(
  tmpPath: string,
  engines: Engine[]
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
  engines: Engine[]
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
  engines: Engine[]
): RendererInterface | undefined {
  let engine = linq
    .from(engines)
    .where((e) => e.ext == ext)
    .select((e) => e.render)
    .firstOrDefault();
  if (engine != undefined && typeof engine == "string") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine = (consolidate as any)[engine] as RendererInterface;
  } else if (Object.keys(consolidate).includes(ext)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine = (consolidate as any)[ext] as RendererInterface;
  }
  return engine;
}

export { consolidate, RendererInterface, Engine, ViewsConfig };
