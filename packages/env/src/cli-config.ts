import { isString } from "@ipare/core";

export const cliConfigHook = (config: any, { command }) => {
  if (!config.build) {
    config.build = {};
  }
  if (!config.build.assets) {
    config.build.assets = [];
  }

  const assets = config.build.assets as any[];
  if (!isAssetExist(assets, (ass) => ass == ".env")) {
    assets.push(".env");
  }
  if (!isAssetExist(assets, (ass) => ass.startsWith(".env."))) {
    if (command == "start") {
      assets.push(".env.*");
    } else {
      assets.push({
        include: ".env.*",
        exclude: ".env.local",
      });
    }
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
