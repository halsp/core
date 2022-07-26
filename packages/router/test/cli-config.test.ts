it("show be error", async () => {
  expect(() => require("../src/cli-config")).toThrow();
});
