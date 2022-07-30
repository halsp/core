import { cliConfigHook } from "../src";

test("cli config hook", async () => {
  const config = cliConfigHook({});
  expect(config).toEqual({
    build: {
      assets: [
        {
          include: "views/*",
          root: "src",
        },
        "views/*",
      ],
    },
  });
});

test("cli config hook with custom assets", async () => {
  const config = cliConfigHook({
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

test("cli config hook with custom include assets", async () => {
  const config = cliConfigHook({
    build: {
      assets: [
        {
          include: "views/*",
        },
      ],
    },
  });
  expect(config).toEqual({
    build: {
      assets: [
        {
          include: "views/*",
        },
      ],
    },
  });
});

test("cli config hook with custom array assets", async () => {
  const config = cliConfigHook({
    build: {
      assets: [
        {
          include: ["views/*"],
        },
      ],
    },
  });
  expect(config).toEqual({
    build: {
      assets: [
        {
          include: ["views/*"],
        },
      ],
    },
  });
});
