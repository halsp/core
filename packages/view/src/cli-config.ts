export const cliConfigHook = (config: any) => {
  if (!config.build) {
    config.build = {};
  }
  if (!config.build.assets) {
    config.build.assets = [];
  }

  const assets = config.build.assets as any[];
  if (!assets.some((ass) => ass.include == "views/*")) {
    assets.push({
      include: "views/*",
      root: "src",
    });
    assets.push({
      include: "views/*",
    });
  }
  return config;
};
