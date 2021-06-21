#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as shell from "shelljs";
import MapCreater from "../dist/Map/MapCreater";
import Constant from "../dist/Constant";

let outDir = "";
const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
if (fs.existsSync(tsconfigPath)) {
  const cfg = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));
  outDir = cfg?.compilerOptions?.outDir ?? "";

  if (outDir) {
    deleteFile(path.join(process.cwd(), outDir));
  }

  const tscResult = shell.exec("tsc");
  if (tscResult.code != 0) {
    throw new Error(tscResult.stderr);
  } else {
    console.log(tscResult.stdout);
  }
  if (outDir) {
    deleteFile(outDir, ".d.ts");
  }

  if (outDir) {
    (cfg?.static ?? []).forEach(
      (staticItem: { source: string; target: string }) => {
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
        const targetPath = path.join(process.cwd(), outDir, target);
        copyFile(sourcePath, targetPath);
      }
    );
    copyFile(
      path.join(process.cwd(), "package.json"),
      path.join(process.cwd(), outDir, "package.json")
    );
  }
}

const dir = process.argv[2];
if (!dir || typeof dir != "string") {
  throw new Error(
    "You need to specify a router dir, like 'sfa-router-build controllers'"
  );
}
const routerDir = path.join(outDir, process.argv[2]);
if (!fs.existsSync(routerDir) || !fs.statSync(routerDir).isDirectory()) {
  throw new Error("The router dir is not exist");
}

new MapCreater(routerDir).write(path.join(outDir, Constant.mapFileName));

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