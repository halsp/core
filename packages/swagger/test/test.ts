import glob from "glob";
const paths = glob.sync("**/*.@(j|t)s", {
  cwd: process.cwd(),
  ignore: ["node_modules/**/*", "**/*.d.ts"],
  absolute: true,
});

console.log("paths", paths, paths.length);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const test = require("./test.js");
console.log("test", test);
