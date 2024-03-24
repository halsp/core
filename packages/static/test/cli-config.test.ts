import { HALSP_CLI_PLUGIN_CONFIG_HOOK } from "../src";

test("cli config hook", async () => {
  const config = HALSP_CLI_PLUGIN_CONFIG_HOOK({});
  expect(config).toEqual({
    build: {
      assets: [
        {
          include: "static/**/*",
          root: "src",
        },
        "static/**/*",
      ],
    },
  });
});

test("cli config hook", async () => {
  const config = HALSP_CLI_PLUGIN_CONFIG_HOOK({
    build: {
      assets: ["static/*"],
    },
  });
  expect(config).toEqual({
    build: {
      assets: ["static/*"],
    },
  });
});
