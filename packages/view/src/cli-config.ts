import { isString } from "@ipare/core";

export const cliConfigHook = (config: any) => {
  if (!config.build) {
    config.build = {};
  }
  if (!config.build.assets) {
    config.build.assets = [];
  }

  const assets = config.build.assets as any[];
  if (!isAssetExist(assets, (ass) => ass.startsWith("views/"))) {
    assets.push({
      include: "views/*",
      root: "src",
    });
    assets.push("views/*");
  }
  return config;
};

function isAssetExist(
  assets: any[],
  compare: (asset: string) => boolean
): boolean {
  return assets.some((item) => {
    if (isString(item)) {
      return compare(item);
    } else {
      if (isString(item.include)) {
        return compare(item.include);
      } else {
        return item.include.some((item: string) => compare(item));
      }
    }
  });
}
