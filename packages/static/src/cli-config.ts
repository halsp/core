export const cliConfigHook = (config: any) => {
  if (!config.build) {
    config.build = {};
  }
  if (!config.build.assets) {
    config.build.assets = [];
  }

  const assets = config.build.assets as any[];
  if (!assets.some((ass) => ass.include == "static/*")) {
    assets.push({
      include: "static/*",
      root: "src",
    });
    assets.push({
      include: "static/*",
    });
  }
  return config;
};
