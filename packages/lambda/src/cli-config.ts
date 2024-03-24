export const HALSP_CLI_PLUGIN_CONFIG_HOOK = (config: any, { command }) => {
  if (!config.build) {
    config.build = {};
  }
  if (typeof config.build.copyPackage == "undefined") {
    config.build.copyPackage = command == "build";
  }
  if (typeof config.build.removeDevDeps == "undefined") {
    config.build.removeDevDeps = command == "build";
  }
  return config;
};
