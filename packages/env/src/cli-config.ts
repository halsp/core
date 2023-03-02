import { getCliAssets, isCliAssetExist } from "@halsp/common";

export const cliConfigHook = (config: any, { command }) => {
  const assets = getCliAssets(config);
  if (!isCliAssetExist(assets, (ass) => ass == ".env")) {
    assets.push(".env");
  }
  if (!isCliAssetExist(assets, (ass) => ass.startsWith(".env."))) {
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
