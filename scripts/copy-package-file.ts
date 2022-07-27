import * as fs from "fs";
import path from "path";
import { getPackages } from "./packages";

const sourceFileName = process.argv[2];
const targetFileName = process.argv[3] ?? sourceFileName;

getPackages().forEach((item) => {
  fs.copyFileSync(
    path.join("packages", sourceFileName),
    path.join("packages", item, targetFileName)
  );
});
