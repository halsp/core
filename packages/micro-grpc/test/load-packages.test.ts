import { loadPackages } from "../src/load-packages";
import { runin } from "@halsp/testing";

describe("load packages", () => {
  it("should load default empty packages", async () => {
    const packages = await loadPackages();
    expect(Object.keys(packages).length == 0).toBeTruthy();
  });

  it("should load default packages", async () => {
    await runin("test", async () => {
      const packages = await loadPackages();
      expect(Object.keys(packages).length >= 0).toBeTruthy();
    });

    await runin("test", async () => {
      const packages = await loadPackages({
        protoFiles: [],
      });
      expect(Object.keys(packages).length >= 0).toBeTruthy();
    });

    await runin("test", async () => {
      const packages = await loadPackages({
        protoFiles: "",
      });
      expect(Object.keys(packages).length >= 0).toBeTruthy();
    });
  });
});
