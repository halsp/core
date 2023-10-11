import * as fs from "fs";
import path from "path";
import "../src";
import { getVersion } from "../src";

describe("version", () => {
  it("should be undefined when version is empty", async () => {
    expect(await getVersion("test/version")).toBeUndefined();
  });

  it("should find package.json up", async () => {
    const current = process.cwd();
    process.chdir("test");
    try {
      const version = JSON.parse(
        fs.readFileSync("../package.json", "utf-8"),
      ).version;
      expect(await getVersion()).toBe(version);
    } finally {
      process.chdir(current);
    }
  });

  it("should not find package.json", async () => {
    const current = process.cwd();
    process.chdir("../../..");
    try {
      expect(await getVersion()).toBeUndefined();
    } finally {
      process.chdir(current);
    }
  });

  it("should find current version", async () => {
    const version = await getVersion();
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8"),
    );
    expect(version).toBe(pkg.version);
  });
});
