import { cliConfigHook } from "../src";

test("cli config hook", async () => {
  const config = cliConfigHook({});
  expect(config).toEqual({
    build: {
      assets: [
        {
          include: ".env",
        },
        {
          include: ".env.*",
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
          include: ".env.local",
        },
      ],
    },
  });
  expect(config).toEqual({
    build: {
      assets: [
        {
          include: ".env.local",
        },
        {
          include: ".env",
        },
      ],
    },
  });
});
