import MapCreater from "../src/map/map-creater";

test("MapCreater: router dir not exist", async () => {
  expect(() => new MapCreater("not-exist")).toThrowError(
    "The router dir is not exist"
  );
});
