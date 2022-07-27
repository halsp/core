import * as fs from "fs";
import path from "path";
import { getPackages } from "./get-packages";

const sourceFileName = process.argv[2];
const targetFileName = process.argv[3] ?? sourceFileName;

getPackages().forEach((item: string) => {
  fs.copyFileSync(
    path.join("packages", sourceFileName),
    path.join("packages", item, targetFileName)
  );
});
