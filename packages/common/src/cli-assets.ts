import { isString } from "./shared";

export function isCliAssetExist(
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
