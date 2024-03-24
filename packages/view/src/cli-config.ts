import { tryAddCliAssets } from "@halsp/core";

export const HALSP_CLI_PLUGIN_CONFIG_HOOK = (config: any) => {
  return tryAddCliAssets(
    config,
    (ass) => ass.startsWith("views/"),
    {
      include: "views/**/*",
      root: "src",
    },
    "views/**/*",
  );
};
