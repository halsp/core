import { Context, Response, Startup } from "@ipare/core";
import {
  consolidate,
  Engine,
  RendererInterface,
  ViewOptions,
} from "./view-options";
import * as path from "path";
import * as fs from "fs";

export function useView(startup: Startup, options: ViewOptions) {
  Context.prototype.view = async function (
    tmpPath,
    locals: Record<string, unknown> = {}
  ) {
    return await render(this, options, tmpPath, locals);
  };
  Response.prototype.view = async function (
    tmpPath,
    locals: Record<string, unknown> = {}
  ) {
    const html = await render(this.ctx, options, tmpPath, locals);
    if (!html) return this;

    if (process.env.IPARE_ENV == "http") {
      this["ok"](html);
      this["set"]("content-type", "text/html");
    } else {
      this.setBody(html);
    }
    return this;
  };

  return startup.use(async (ctx, next) => {
    ctx.state = {};
    await next();
  });
}

async function render(
  ctx: Context,
  options: ViewOptions,
  tmpPath: string,
  locals: Record<string, unknown>
): Promise<string | undefined> {
  tmpPath = path.join(options.dir ?? "views", tmpPath ?? "");
  options.options = Object.assign(
    options.options ?? {},
    ctx.state ?? {},
    locals ?? {}
  );
  let engines = options.engines ?? [];
  if (!Array.isArray(engines)) {
    engines = [engines];
  }

  const file = getFile(tmpPath, engines);
  if (!file) return;

  const engine = getEngine(file.ext, engines);
  if (engine) {
    return await engine(file.filePath, options.options);
  } else if (file.ext == "html") {
    return await fs.promises.readFile(file.filePath, "utf-8");
  }
  return;
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
  let engine = engines.filter((e) => e.ext == ext).map((e) => e.render)[0];
  if (engine != undefined && typeof engine == "string") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine = (consolidate as any)[engine] as RendererInterface;
  } else if (Object.keys(consolidate).includes(ext)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine = (consolidate as any)[ext] as RendererInterface;
  }
  return engine;
}
