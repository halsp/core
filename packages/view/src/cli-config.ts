import { tryAddCliAssets } from "@ipare/core";

export const cliConfigHook = (config: any) => {
  return tryAddCliAssets(
    config,
    (ass) => ass.startsWith("views/"),
    {
      include: "views/**/*",
      root: "src",
    },
    "views/**/*"
  );
};
