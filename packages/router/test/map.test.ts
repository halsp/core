import MapCreater from "../src/Map/MapCreater";
import * as fs from "fs";
import Constant from "../src/Constant";

test("map creater", async function () {
  const result = new MapCreater("test/controllers");
  result.write("./test.json");
  expect(fs.existsSync("./test.json")).toBeTruthy();
  fs.unlinkSync("./test.json");
});

test("map creater write default", async function () {
  const result = new MapCreater("test/controllers");
  result.write();
  expect(fs.existsSync(Constant.mapFileName)).toBeTruthy();
  fs.unlinkSync(Constant.mapFileName);
});

test("the router dir is not exist", async function () {
  expect(() => new MapCreater("test/controllers1")).toThrow(
    "the router dir is not exist"
  );
});
