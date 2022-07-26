import * as fs from "fs";
import path from "path";

fs.readdirSync("packages")
  .filter((item) => fs.statSync(path.join("packages", item)).isDirectory())
  .filter((item) => fs.existsSync(path.join("packages", item, "package.json")))
  .forEach((item) => {
    fs.copyFileSync(
      "packages/jest.config.js",
      `packages/${item}/jest.config.js`
    );
    fs.copyFileSync(
      "packages/jest.setup.js",
      `packages/${item}/jest.setup.js`
    );
  });
