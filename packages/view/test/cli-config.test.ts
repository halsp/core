import { HALSP_CLI_PLUGIN_CONFIG_HOOK } from "../src";

test("cli config hook", async () => {
  const config = HALSP_CLI_PLUGIN_CONFIG_HOOK({});
  expect(config).toEqual({
    build: {
      assets: [
        {
          include: "views/**/*",
          root: "src",
        },
        "views/**/*",
      ],
    },
  });
});

test("cli config hook with custom assets", async () => {
  const config = HALSP_CLI_PLUGIN_CONFIG_HOOK({
    build: {
      assets: ["views/*"],
    },
  });
  expect(config).toEqual({
    build: {
      assets: ["views/*"],
    },
  });
});
