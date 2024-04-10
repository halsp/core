import { safeImport } from "../src";

describe("safeImport", () => {
  it("should import commonjs package", async () => {
    const dep = await safeImport("typescript");
    expect(dep).not.toBeNull();
  });

  it("should import esm package", async () => {
    const dep = await safeImport("@halsp/core");
    expect(dep).not.toBeNull();
  });

  it("should be null when package is not exist", async () => {
    const dep = await safeImport("not-exist");
    expect(dep).toBeNull();
  });
});
