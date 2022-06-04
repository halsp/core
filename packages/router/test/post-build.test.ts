import { runin } from "@sfajs/testing";
import { routerPostBuild } from "../src";
import { CliStartup } from "@sfajs/cli/dist/cli-startup";
import { BuildMiddlware } from "@sfajs/cli/dist/middlewares/build.middleware";
import { existsSync } from "fs";

test("post build", async () => {
  let count = 0;
  await runin("test/post-build", async () => {
    await new CliStartup()
      .add(BuildMiddlware)
      .use(async (ctx) => {
        await routerPostBuild(ctx);
        count++;
      })
      .run();

    expect(existsSync(".sfa-cache")).toBeTruthy();
    expect(existsSync(".sfa-cache/sfa-router.map")).toBeTruthy();
    expect(existsSync(".sfa-cache/sfa-router-config.json")).toBeTruthy();
    count++;
  });
  expect(count).toBe(2);
});
