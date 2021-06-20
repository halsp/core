#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { ApiDocsConfig, TsConfig } from "../dist";
import ApiDocsCreater from "../dist/ApiDocs/ApiDocsCreater";

const dir = process.argv[2];
if (!dir || typeof dir != "string") {
  throw new Error(
    "You need to specify a router dir, like 'router-docs controllers'"
  );
}
const outDir = TsConfig.outDir;
const routerDir = path.join(outDir, process.argv[2]);
if (!fs.existsSync(routerDir) || !fs.statSync(routerDir).isDirectory()) {
  throw new Error("The router dir is not exist");
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkgCfg = require(path.join(process.cwd(), "package.json"));
const docCfg = pkgCfg?.docs as ApiDocsConfig;
if (!docCfg) {
  throw new Error(
    "There is no docs config, you need to add docs config in package.json"
  );
}

new ApiDocsCreater(docCfg, routerDir).write(docCfg.output);
