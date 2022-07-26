import * as fs from "fs";
import path from "path";

const sourceFileName = process.argv[2];
const targetFileName = process.argv[3] ?? sourceFileName;

fs.readdirSync("packages")
  .filter((item) => fs.statSync(path.join("packages", item)).isDirectory())
  .filter((item) => fs.existsSync(path.join("packages", item, "package.json")))
  .forEach((item) => {
    fs.copyFileSync(
      `packages/${sourceFileName}`,
      `packages/${item}/${targetFileName}`
    );
  });
