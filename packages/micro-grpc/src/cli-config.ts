import { tryAddCliAssets } from "@halsp/core";

export const cliConfigHook = (config: any) => {
  return tryAddCliAssets(
    config,
    (ass) => ass.startsWith("protos/"),
    {
      include: "protos/**/*.proto",
      root: "src",
    },
    "protos/**/*.proto",
  );
};
