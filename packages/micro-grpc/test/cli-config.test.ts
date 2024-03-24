import { HALSP_CLI_PLUGIN_CONFIG_HOOK } from "../src";

test("cli config hook", async () => {
  const config = HALSP_CLI_PLUGIN_CONFIG_HOOK({});
  expect(config).toEqual({
    build: {
      assets: [
        {
          include: "protos/**/*.proto",
          root: "src",
        },
        "protos/**/*.proto",
      ],
    },
  });
});

test("cli config hook", async () => {
  const config = HALSP_CLI_PLUGIN_CONFIG_HOOK({
    build: {
      assets: ["protos/**/*.proto"],
    },
  });
  expect(config).toEqual({
    build: {
      assets: ["protos/**/*.proto"],
    },
  });
});
