import { routerPostBuild } from "../src";
import * as fs from "fs";
import { SfaRequest, TestStartup } from "@sfajs/core";

test("empty config", async () => {
  let count = 0;
  try {
    await routerPostBuild({
      config: {},
      cacheDir: ".sfa-cache",
      mode: "",
      command: "build",
    });
  } catch (err) {
    count++;
    expect((err as Error).message).toBe("The router dir is not exist");
  }
  expect(count).toBe(1);
});

test("build actions", async () => {
  fs.rmSync("test/sfa-router-config.json", {
    force: true,
  });

  await routerPostBuild({
    config: {
      router: {
        dir: "actions",
      },
    },
    cacheDir: "test",
    mode: "",
    command: "build",
  });

  expect(fs.existsSync("test/sfa-router-config.json")).toBeTruthy();
});

test("build and run", async () => {
  await routerPostBuild({
    config: {
      router: {
        dir: "test/actions",
      },
    },
    cacheDir: "",
    mode: "",
    command: "build",
  });

  const res = await new TestStartup(new SfaRequest().setMethod("get"))
    .useRouter()
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    method: "GET",
  });
});

// test("build config", async () => {
//   fs.unlinkSync("test/sfa-router-config.json");
//   fs.unlinkSync("test/sfa-router.map");

//   await routerPostBuild({
//     config: {
//       router: {
//         dir: "",
//         customMethods: ["cu"],
//         prefix: "pre",
//       },
//     },
//     cacheDir: "test",
//     mode: "",
//     command: "build",
//   });

//   expect(fs.existsSync("test/sfa-router-config.json")).toBeTruthy();
//   expect(fs.existsSync("test/sfa-router.map")).toBeTruthy();
// });

// test("error router dir", async () => {
//   let count = 0;
//   await runin("test/post-build", async () => {
//     await new CliStartup()
//       .add(BuildMiddlware)
//       .use(async (ctx) => {
//         await routerPostBuild(ctx);
//         count++;
//       })
//       .run();
//     const configPath = ".sfa-cache/sfa-router-config.json";
//     expect(fs.existsSync(configPath)).toBeTruthy();
//     const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
//     config.dir = "actions1";
//     fs.writeFileSync(configPath, JSON.stringify(config));

//     await runin("./.sfa-cache", async () => {
//       const res = await new TestStartup()
//         .use(async (ctx, next) => {
//           ctx.ok();
//           await next();
//         })
//         .useRouter()
//         .run(new SfaRequest().setMethod("get"));
//       expect(res.status).toBe(404);
//       count++;
//     });
//   });
//   expect(count).toBe(2);
// });
