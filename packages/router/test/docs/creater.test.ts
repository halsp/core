import * as fs from "fs";
import ApiDocsCreater from "../../src/ApiDocs/ApiDocsCreater";
import "../UseTest";
import "../../src";
import { ApiDocsConfig } from "../../src";

const config = JSON.parse(
  fs.readFileSync("./test/docs//docs.config.json", "utf-8")
) as ApiDocsConfig;

const creater = new ApiDocsCreater(config, "./test/controllers");

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

// test("without doc config", async function () {
//   const creater = new ApiDocsCreater(undefined as any,'');
//   expect(() => creater.docConfig).toThrow("there is no doc config");
// });

// test("default router dir", async function () {
//   const creater = new ApiDocsCreater(config);
//   expect(() => creater.docs).toThrow("the router dir is not exist");
// });
