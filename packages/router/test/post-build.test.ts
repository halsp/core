import { runin } from "@sfajs/testing";
import { routerPostBuild } from "../src";
import { CliStartup } from "@sfajs/cli/dist/cli-startup";
import { BuildMiddlware } from "@sfajs/cli/dist/middlewares/build.middleware";
import * as fs from "fs";
import { SfaRequest, TestStartup } from "@sfajs/core";

function testPostBuild(configName = "") {
  test(`post build ${configName}`, async () => {
    let count = 0;
    await runin("test/post-build", async () => {
      const res = await new CliStartup(undefined, {
        configName: configName,
      })
        .add(BuildMiddlware)
        .use(async (ctx) => {
          await routerPostBuild(ctx);
          count++;
        })
        .run();

      expect(res.status).toBe(404);

      expect(fs.existsSync(".sfa-cache")).toBeTruthy();
      expect(fs.existsSync(".sfa-cache/sfa-router.map")).toBeTruthy();
      expect(fs.existsSync(".sfa-cache/sfa-router-config.json")).toBeTruthy();
      count++;
    });
    expect(count).toBe(2);
  });
}
testPostBuild();
testPostBuild("sfa-cli-blank.config.ts");

test("config not exist actions", async () => {
  let count = 0;
  await runin("test/post-build", async () => {
    try {
      await new CliStartup(undefined, {
        configName: "sfa-cli-not-exist.config.ts",
      })
        .add(BuildMiddlware)
        .use(async (ctx) => {
          await routerPostBuild(ctx);
          count++;
        })
        .run();
    } catch (err) {
      count++;
      expect((err as Error).message).toBe("The router dir is not exist");
    }
  });
  expect(count).toBe(1);
});

test("config", async () => {
  let count = 0;
  await runin("test/post-build", async () => {
    await new CliStartup()
      .add(BuildMiddlware)
      .use(async (ctx) => {
        await routerPostBuild(ctx);
        count++;
      })
      .run();
    const configPath = ".sfa-cache/sfa-router-config.json";
    expect(fs.existsSync(configPath)).toBeTruthy();
    expect(JSON.parse(fs.readFileSync(configPath, "utf-8"))).toEqual({
      dir: "actions",
      customMethods: ["cu"],
      prefix: "",
    });
  });
  expect(count).toBe(1);
});

test("error router dir", async () => {
  let count = 0;
  await runin("test/post-build", async () => {
    await new CliStartup()
      .add(BuildMiddlware)
      .use(async (ctx) => {
        await routerPostBuild(ctx);
        count++;
      })
      .run();
    const configPath = ".sfa-cache/sfa-router-config.json";
    expect(fs.existsSync(configPath)).toBeTruthy();
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    config.dir = "actions1";
    fs.writeFileSync(configPath, JSON.stringify(config));

    await runin("./.sfa-cache", async () => {
      const res = await new TestStartup()
        .use(async (ctx, next) => {
          ctx.ok();
          await next();
        })
        .useRouter()
        .run(new SfaRequest().setMethod("get"));
      expect(res.status).toBe(404);
      count++;
    });
  });
  expect(count).toBe(2);
});
