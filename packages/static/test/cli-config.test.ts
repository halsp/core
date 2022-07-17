import { cliConfigHook } from "../src";

test("cli config hook", async () => {
  const config = cliConfigHook({});
  expect(config).toEqual({
    build: {
      assets: [
        {
          include: "static/*",
          root: "src",
        },
        {
          include: "static/*",
        },
      ],
    },
  });
});

test("cli config hook with custom assets", async () => {
  const config = cliConfigHook({
    build: {
      assets: [
        {
          include: "static/*",
        },
      ],
    },
  });
  expect(config).toEqual({
    build: {
      assets: [
        {
          include: "static/*",
        },
      ],
    },
  });
});
