import { cliConfig } from "../src";

test("cli-config", async () => {
  expect(cliConfig).toEqual({
    build: {
      copyPackage: true,
    },
  });
});
