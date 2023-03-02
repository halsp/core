import { tryAddCliAssets } from "@halsp/common";

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
