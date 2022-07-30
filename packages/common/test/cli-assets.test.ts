import { isCliAssetExist, tryAddCliAssets } from "../src";

test("string array", async () => {
  expect(
    isCliAssetExist(["views/*"], (asset) => asset.startsWith("views/"))
  ).toBeTruthy();
});
test("string array not exist", async () => {
  expect(
    isCliAssetExist(["static"], (asset) => asset.startsWith("views/"))
  ).toBeFalsy();
});

test("object", async () => {
  expect(
    isCliAssetExist(
      [
        {
          include: "views/*",
        },
      ],
      (asset) => asset.startsWith("views/")
    )
  ).toBeTruthy();
});
test("object not exist", async () => {
  expect(
    isCliAssetExist(
      [
        {
          include: "static",
        },
      ],
      (asset) => asset.startsWith("views/")
    )
  ).toBeFalsy();
});

test("include array", async () => {
  expect(
    isCliAssetExist(
      [
        {
          include: ["views/*"],
        },
      ],
      (asset) => asset.startsWith("views/")
    )
  ).toBeTruthy();
});
test("include not exist", async () => {
  expect(
    isCliAssetExist(
      [
        {
          include: ["static"],
        },
      ],
      (asset) => asset.startsWith("views/")
    )
  ).toBeFalsy();
});

test("cli config hook", async () => {
  const config = tryAddCliAssets(
    {},
    (asset) => asset.startsWith("views/"),
    "views/*"
  );
  expect(config).toEqual({
    build: {
      assets: ["views/*"],
    },
  });
});
