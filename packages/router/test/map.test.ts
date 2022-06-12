import { HttpContext, SfaRequest } from "@sfajs/core";
import MapCreater from "../src/map/map-creater";
import MapParser from "../src/map/map-parser";

test("MapCreater: router dir not exist", async () => {
  expect(() => new MapCreater("not-exist")).toThrowError(
    "the router dir is not exist"
  );
});

test("MapParser: router dir not exist", async () => {
  const mapParser = new MapParser(new HttpContext(new SfaRequest()), {} as any);
  expect(mapParser.notFound).toBeTruthy();
});
