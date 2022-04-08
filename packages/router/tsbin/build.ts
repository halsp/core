#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as shell from "shelljs";
import MapCreater from "../dist/map/map-creater";
import { MAP_FILE_NAME } from "../dist/constant";

type StaticItem = string | { source: string; target: string };

const actionsDir = process.argv[2] || "actions";

const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
if (fs.existsSync(tsconfigPath)) {
  buildTs();
} else {
  buildJs();
}

function buildTs() {
  const cfg = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));
  const outDir: string = cfg?.compilerOptions?.outDir ?? "";
  const cacheDir = outDir ? ".cache-sfra" : "";

  if (outDir) {
    deleteFile(path.join(process.cwd(), cacheDir));
    deleteFile(path.join(process.cwd(), outDir));
  }

  const tscResult = shell.exec(cacheDir ? `tsc --outDir ${cacheDir}` : `tsc`);
  if (tscResult.code != 0) {
    throw new Error(tscResult.stderr);
  } else {
    console.log(tscResult.stdout);
  }
  if (cacheDir) {
    deleteFile(cacheDir, ".d.ts");
  }

  if (cacheDir) {
    const staticItems: StaticItem[] = cfg?.static ?? [];
    staticItems.forEach((staticItem) => {
      let source: string;
      let target: string;
      if (typeof staticItem == "string") {
        source = staticItem;
        target = staticItem;
      } else {
        source = staticItem.source;
        target = staticItem.target;
      }
      const sourcePath = path.join(process.cwd(), source);
      const targetPath = path.join(process.cwd(), cacheDir, target);
      copyFile(sourcePath, targetPath);
    });
    copyFile(
      path.join(process.cwd(), "package.json"),
      path.join(process.cwd(), cacheDir, "package.json")
    );
  }

  createMap(actionsDir, cacheDir);

  if (cacheDir) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.rmdirSync(path.join(process.cwd(), outDir));
    fs.renameSync(cacheDir, outDir);
  }
}

function buildJs() {
  createMap(actionsDir);
}

function createMap(routerDir: string, outDir?: string) {
  routerDir = path.join(outDir ?? "", actionsDir);
  if (!fs.existsSync(routerDir) || !fs.statSync(routerDir).isDirectory()) {
    throw new Error("The router dir is not exist");
  }
  new MapCreater(routerDir).write(path.join(outDir ?? "", MAP_FILE_NAME));
}

function deleteFile(filePath: string, type?: string) {
  if (!fs.existsSync(filePath)) return;

  const stat = fs.statSync(filePath);
  if (stat.isFile()) {
    if (!type || filePath.endsWith(type)) {
      fs.unlinkSync(filePath);
    }
  } else if (stat.isDirectory()) {
    fs.readdirSync(filePath).forEach((file) => {
      deleteFile(path.join(filePath, file), type);
    });
    if (!fs.readdirSync(filePath).length) {
      fs.rmdirSync(filePath);
    }
  }
}

function copyFile(source: string, target: string) {
  if (!fs.existsSync(source)) return;
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target);
    }
    const files = fs.readdirSync(source);
    files.forEach((file) => {
      copyFile(path.join(source, file), path.join(target, file));
    });
  } else if (stat.isFile()) {
    fs.copyFileSync(source, target);
  }
}
