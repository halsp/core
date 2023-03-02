import { tryAddCliAssets } from "@halsp/core";

export const cliConfigHook = (config: any) => {
  return tryAddCliAssets(
    config,
    (ass) => ass.startsWith("static/"),
    {
      include: "static/**/*",
      root: "src",
    },
    "static/**/*"
  );
};
