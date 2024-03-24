import { HALSP_CLI_PLUGIN_CONFIG_HOOK } from "../src";

test("cli config hook with start command", async () => {
  const config = HALSP_CLI_PLUGIN_CONFIG_HOOK({}, { command: "start" });
  expect(config).toEqual({
    build: {
      assets: [".env", ".env.*"],
    },
  });
});

test("cli config hook with build command", async () => {
  const config = HALSP_CLI_PLUGIN_CONFIG_HOOK({}, { command: "build" });
  expect(config).toEqual({
    build: {
      assets: [
        ".env",
        {
          include: ".env.*",
          exclude: ".env.local",
        },
      ],
    },
  });
});

test("cli config hook with custom assets", async () => {
  const config = HALSP_CLI_PLUGIN_CONFIG_HOOK(
    {
      build: {
        assets: [
          {
            include: ".env.local",
          },
        ],
      },
    },
    { command: "start" },
  );
  expect(config).toEqual({
    build: {
      assets: [
        {
          include: ".env.local",
        },
        ".env",
      ],
    },
  });
});

test("cli config hook with custom array assets", async () => {
  const config = HALSP_CLI_PLUGIN_CONFIG_HOOK(
    {
      build: {
        assets: [
          {
            include: [".env.local"],
          },
        ],
      },
    },
    { command: "start" },
  );
  expect(config).toEqual({
    build: {
      assets: [
        {
          include: [".env.local"],
        },
        ".env",
      ],
    },
  });
});
