import { cliConfigHook } from "../src";

test("cli config hook", async () => {
  const config = cliConfigHook({});
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
  const config = cliConfigHook({
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
