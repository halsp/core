import { cliConfigHook } from "../src";

test("cli config hook with start command", async () => {
  expect(cliConfigHook({}, { command: "start" })).toEqual({
    build: {
      copyPackage: false,
    },
  });
});

test("cli config hook with build command", async () => {
  expect(cliConfigHook({ build: {} }, { command: "build" })).toEqual({
    build: {
      copyPackage: true,
    },
  });
});
