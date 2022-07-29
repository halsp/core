export const cliConfigHook = (config: any) => {
  if (!config.build) {
    config.build = {};
  }
  if (!config.build.assets) {
    config.build.assets = [];
  }

  const assets = config.build.assets as any[];
  if (!assets.some((ass) => ass.include == ".env")) {
    assets.push({
      include: ".env",
    });
  }
  if (!assets.some((ass) => !!ass.include?.startsWith(".env."))) {
    assets.push({
      include: ".env.*",
    });
  }
  return config;
};
