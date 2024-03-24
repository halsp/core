import { HALSP_CLI_PLUGIN_CONFIG_HOOK } from "../src";

test("cli config hook with start command", async () => {
  expect(HALSP_CLI_PLUGIN_CONFIG_HOOK({}, { command: "start" })).toEqual({
    build: {
      copyPackage: false,
      removeDevDeps: false,
    },
  });
});

test("cli config hook with build command", async () => {
  expect(
    HALSP_CLI_PLUGIN_CONFIG_HOOK({ build: {} }, { command: "build" }),
  ).toEqual({
    build: {
      copyPackage: true,
      removeDevDeps: true,
    },
  });
});
