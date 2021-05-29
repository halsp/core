#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as shell from "shelljs";
import { Config } from "../dist";
import MapCreater from "../dist/Router/MapCreater";
import Constant from "../dist/Constant";

const outDir = Config.outDir;
if (Config.tsconfig) {
  if (outDir) {
    deleteFile(path.join(process.cwd(), outDir));
  }

  const tscResult = shell.exec("tsc");
  if (tscResult.code != 0) {
    throw new Error(tscResult.stderr);
  } else {
    console.log(tscResult.stdout);
  }
  deleteFile(outDir, ".d.ts");

  if (outDir) {
    if (Config.default.ts && Config.default.ts.static) {
      Config.default.ts.static.forEach((staticItem) => {
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
      });
    }
    copyFile(
      path.join(process.cwd(), "package.json"),
      path.join(process.cwd(), outDir, "package.json")
    );
    copyFile(
      path.join(process.cwd(), Constant.configFileName),
      path.join(process.cwd(), outDir, Constant.configFileName)
    );
  }
}

new MapCreater(Config.getRouterDirPath(Config.default)).write(
  path.join(Config.outDir, Constant.mapFileName)
);

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
