import path from "path";
import * as fs from "fs";
import MapItem from "./map-item";
import { DEFAULT_MODULES_DIR, HALSP_ROUTER_IS_MODULE } from "../constant";
import { safeImport } from "@halsp/core";

export interface RouterModule {
  prefix?: string;
  decorators?: ClassDecorator[] | ((mapItem: MapItem) => ClassDecorator[]);
  deepDir?: string;
}

export function defineModule(arg: RouterModule | (() => RouterModule)) {
  if (typeof arg == "function") {
    return arg();
  } else {
    return arg;
  }
}

function findModulePath(dir: string, file: string): string | null {
  let moduleDir = file.replace(/\\/g, "/");
  if (!moduleDir.includes("/")) {
    return null;
  }

  moduleDir = moduleDir.replace(/\/.+$/, "");

  const files = [
    "module.js",
    "module.cjs",
    "module.ejs",
    "module.ts",
    "module.cts",
    "module.cjs",
  ].map((item) => ({
    name: item,
    path: path.join(dir, moduleDir, item),
  }));
  for (const fileItem of files) {
    if (fs.existsSync(fileItem.path)) {
      return path.join(moduleDir, fileItem.name).replace(/\\/g, "/");
    }
  }
  return null;
}

function getModuleFilePath(dir: string, file: string) {
  const moduleFilePath = findModulePath(dir, file);
  return moduleFilePath ?? undefined;
}

export async function getModuleConfig(
  dir: string,
  file: string,
): Promise<RouterModule | undefined> {
  const moduleFilePath = getModuleFilePath(dir, file);
  if (moduleFilePath) {
    const moduleRequire = await safeImport(path.resolve(dir, moduleFilePath));
    return moduleRequire.default ?? moduleRequire;
  }
}

export function isModule(dir: string) {
  if (!!process.env[HALSP_ROUTER_IS_MODULE]) {
    return process.env[HALSP_ROUTER_IS_MODULE].toLowerCase() == "true";
  }

  return dir.endsWith(DEFAULT_MODULES_DIR);
}
