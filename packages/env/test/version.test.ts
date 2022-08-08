import { TestStartup } from "@ipare/testing";
import * as fs from "fs";
import "../src";

test("use version", async () => {
  const res = await new TestStartup()
    .useVersion()
    .use((ctx) => {
      ctx.ok(process.env);
    })
    .run();

  const version = JSON.parse(fs.readFileSync("package.json", "utf-8")).version;
  expect(res.getHeader("version")).toBe(version);
});

test("use version custom header", async () => {
  const res = await new TestStartup()
    .useVersion("h1", "test/version")
    .use((ctx) => {
      ctx.ok(process.env);
    })
    .run();
  expect(res.getHeader("h1")).toBe("0");
  expect(res.getHeader("version")).toBeUndefined();
});

it("should find package.json up", async () => {
  const current = process.cwd();
  process.chdir("test");
  try {
    const res = await new TestStartup()
      .useVersion()
      .use((ctx) => {
        ctx.ok(process.env);
      })
      .run();

    const version = JSON.parse(
      fs.readFileSync("../package.json", "utf-8")
    ).version;
    expect(res.getHeader("version")).toBe(version);
  } finally {
    process.chdir(current);
  }
});

it("should not find package.json", async () => {
  const current = process.cwd();
  process.chdir("../../..");
  try {
    const res = await new TestStartup()
      .useVersion()
      .use((ctx) => {
        ctx.ok(process.env);
      })
      .run();

    expect(res.getHeader("version")).toBe("0");
  } finally {
    process.chdir(current);
  }
});
