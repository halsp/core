export const cliConfigHook = (config: any, { command }) => {
  if (!config.build) {
    config.build = {};
  }
  config.build.copyPackage = command == "build";
  return config;
};
