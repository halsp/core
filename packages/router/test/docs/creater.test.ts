import * as fs from "fs";
import ApiDocsCreater from "../../src/ApiDocs/ApiDocsCreater";
import { AppConfig } from "../../src/Config";
import Constant from "../../src/Constant";
import "../UseTest";
import "../../src";

const configPath = `./demo/${Constant.configFileName}`;
const config = JSON.parse(fs.readFileSync(configPath, "utf-8")) as AppConfig;
if (!config || !config.router) {
  throw new Error();
}
config.router.dir = "./test/controllers";

const creater = new ApiDocsCreater(config);
Object.defineProperty(creater, "routerDir", {
  get: function () {
    return "./test/controllers";
  },
});

test("api docs creater", async function () {
  const docs = creater.docs;
  expect(!!docs).toBe(true);
});

test("api docs write", async function () {
  creater.write("./test.md");
  expect(fs.existsSync("./test.md")).toBeTruthy();
  fs.unlinkSync("./test.md");
});

test("api docs write empty", async function () {
  expect(() => creater.write("")).toThrow(
    `please input target file path, for example 'docs/api.md'`
  );
});

test("without doc config", async function () {
  const cfg = Object.assign({}, config);
  delete cfg.doc;
  const creater = new ApiDocsCreater(cfg);
  expect(() => creater.docConfig).toThrow("there is no doc config");
});

test("default router dir", async function () {
  const creater = new ApiDocsCreater(config);
  expect(() => creater.docs).toThrow("the router dir is not exist");
});
