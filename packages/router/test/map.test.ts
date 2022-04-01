import MapCreater from "../src/map/map-creater";
import * as fs from "fs";
import { MAP_FILE_NAME } from "../src/constant";
import { TestStartup, SfaRequest } from "@sfajs/core";
import "../src";
import { routerCfg } from "./global";

test("map creater", async function () {
  const result = new MapCreater("test/actions");
  result.write("./test.json");
  expect(fs.existsSync("./test.json")).toBeTruthy();
  fs.unlinkSync("./test.json");
});

test("map creater write default", async function () {
  const result = new MapCreater("test/actions");
  result.write();
  try {
    expect(fs.existsSync(MAP_FILE_NAME)).toBeTruthy();

    const res = await new TestStartup(
      new SfaRequest().setPath("/simple/router").setMethod("POST")
    )
      .useRouter(routerCfg)
      .run();
    expect(res.status).toBe(200);
  } finally {
    fs.unlinkSync(MAP_FILE_NAME);
  }
});

test("the router dir is not exist", async function () {
  expect(() => new MapCreater("test/actions1")).toThrow(
    "the router dir is not exist"
  );
});
