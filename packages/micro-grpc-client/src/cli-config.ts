import { tryAddCliAssets } from "@ipare/core";

export const cliConfigHook = (config: any) => {
  return tryAddCliAssets(
    config,
    (ass) => ass.startsWith("protos/"),
    {
      include: "protos/**/*.proto",
      root: "src",
    },
    "protos/**/*.proto"
  );
};
