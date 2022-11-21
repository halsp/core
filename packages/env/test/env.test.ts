import { TestStartup } from "@ipare/testing";
import "../src";
import { getEnv } from "./utils";

describe("env", () => {
  it("should load env with empty options", async () => {
    const env = await getEnv("");
    expect(env.BNAME).toBe("BASE");
    expect(env.NAME).toBeUndefined();
    expect(env.SNAME).toBeUndefined();
  });

  it("should load env with cwd", async () => {
    const { ctx } = await new TestStartup()
      .useEnv({
        mode: "production",
        cwd: "test/envs",
        override: true,
      })
      .use((ctx) => {
        ctx.bag("env", process.env);
      })
      .run();
    const env = ctx.bag<typeof process.env>("env");

    expect(env.BNAME).toBe("PRODUCTION");
    expect(env.NAME).toBe("PRODUCTION");
    expect(env.SNAME).toBe("PROD");
  });
});

describe("mode", () => {
  it("should load env with options", async () => {
    const env = await getEnv({
      mode: "development",
    });
    expect(env.BNAME).toBe("DEVELOPMENT");
    expect(env.NAME).toBe("DEVELOPMENT");
    expect(env.SNAME).toBe("DEV");
  });

  it("should load env with default mode", async () => {
    delete process.env.NODE_ENV;
    await getEnv();
    expect(process.env.NODE_ENV).toBe("production");
  });
});

describe("debug", () => {
  it("should load env with debug value true", async () => {
    const env = await getEnv({
      mode: "stage",
      debug: true,
    });
    expect(env.NAME).toBe("STAGE");
  });

  it("should load env with IPARE_DEBUG", async () => {
    process.env.IPARE_DEBUG = "true";
    const env = await getEnv({
      mode: "stage",
    });
    process.env.IPARE_DEBUG = "";
    expect(env.NAME).toBe("STAGE");
  });
});
