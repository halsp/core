import path from "path";
import * as fs from "fs";
import MapItem from "./map-item";

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

export function findModulePath(dir: string, file: string): string | null {
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
