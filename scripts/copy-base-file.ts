import * as fs from "fs";
import path from "path";

const fileName = process.argv[2];

fs.readdirSync("packages")
  .filter((item) => fs.statSync(path.join("packages", item)).isDirectory())
  .filter((item) => fs.existsSync(path.join("packages", item, "package.json")))
  .forEach((item) => {
    fs.copyFileSync(fileName, path.join("packages", item, fileName));
  });
