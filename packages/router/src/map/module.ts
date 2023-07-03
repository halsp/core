import path from "path";
import * as fs from "fs";
import MapItem from "./map-item";
import { DEFAULT_MODULES_DIR, HALSP_ROUTER_MODULE } from "../constant";

export interface RouterModule {
  prefix?: string;
  decorators?: ClassDecorator[] | ((mapItem: MapItem) => ClassDecorator[]);
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

  const jsPath = path.join(dir, moduleDir, "module.js");
  if (fs.existsSync(jsPath)) {
    return path.join(moduleDir, "module").replace(/\\/g, "/");
  }

  const tsPath = path.join(dir, moduleDir, "module.ts");
  if (fs.existsSync(tsPath)) {
    return path.join(moduleDir, "module").replace(/\\/g, "/");
  }

  return null;
}

function getModuleFilePath(dir: string, file: string) {
  const moduleFilePath = findModulePath(dir, file);
  return moduleFilePath ?? undefined;
}

export function getModuleConfig(
  dir: string,
  file: string
): RouterModule | undefined {
  const moduleFilePath = getModuleFilePath(dir, file);
  if (moduleFilePath) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const moduleRequire = require(path.resolve(dir, moduleFilePath));
    return moduleRequire.default ?? moduleRequire;
  }
}

export function isModule(dir: string) {
  if (!!process.env[HALSP_ROUTER_MODULE]) {
    return process.env[HALSP_ROUTER_MODULE].toLowerCase() == "true";
  }

  return dir == DEFAULT_MODULES_DIR;
}
