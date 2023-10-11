import { isString } from "./typeis";

export function isCliAssetExist(
  assets: any[],
  compare: (asset: string) => boolean,
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

export function tryAddCliAssets(
  config: any,
  compare: (asset: string) => boolean,
  ...addAssets: any[]
) {
  const assets = getCliAssets(config);

  if (!isCliAssetExist(assets, compare)) {
    assets.push(...addAssets);
  }
  return config;
}

export function getCliAssets(config: any) {
  if (!config.build) {
    config.build = {};
  }
  if (!config.build.assets) {
    config.build.assets = [];
  }
  return config.build.assets as any[];
}
