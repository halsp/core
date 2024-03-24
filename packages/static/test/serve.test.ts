import { Server } from "http";
import supertest from "supertest";
import { Context, Startup } from "@halsp/core";
import { HALSP_CLI_PLUGIN_ATTACH } from "../src";
import { Command } from "commander";
import "../src";
import "@halsp/native";
import "@halsp/testing";
import { runin } from "@halsp/testing";

let port = 9600;
function getPort() {
  return port++;
}

function testResultAfter2000ms(
  ctx: Context,
  test: (server: Server) => Promise<void>,
  cb: (err?: Error) => void,
) {
  setTimeout(async () => {
    const server = ctx.res.body as Server;
    try {
      await test(server);
    } catch (e) {
      cb(e as Error);
    } finally {
      server.close(() => {
        cb();
      });
    }
  }, 2000);
}

async function startServer(ctx: Context, args: string[]) {
  const program = new Command();
  HALSP_CLI_PLUGIN_ATTACH.register(program);
  program.parseAsync(["node", "test", ...args]);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  ctx.res.body = program["@halsp/static/serve/server"];
}

describe("exclude", () => {
  async function runTest(exclude: string) {
    await new Promise<void>(async (resolve, reject) => {
      await new Startup()
        .use(async (ctx, next) => {
          testResultAfter2000ms(
            ctx,
            async (server) => {
              await supertest(server)
                .get("/index")
                .expect(exclude ? 404 : 200)
                .expect((exclude ? /<span>404<\/span>/ : "test") as any)
                .expect("content-type", "text/html");
            },
            (err) => (err ? reject(err) : resolve()),
          );
          await next();
        })
        .use(async (ctx) => {
          await startServer(ctx, [
            "serve",
            "test/serve",
            "--port",
            getPort().toString(),
            ...(exclude ? ["--exclude", ...exclude.split(" ")] : []),
          ]);
        })
        .test();
    });
  }

  it("should return index.html when exclude is undefined", async () => {
    await runTest("");
  });
  it("should return 404.html when exclude is *.html", async () => {
    await runTest("*.html");
  });
  it("should return 404.html when exclude is '*.html *.txt'", async () => {
    await runTest("*.html *.txt");
  });
});

describe("dir", () => {
  async function runTest(hideDir: true | undefined) {
    await new Promise<void>(async (resolve, reject) => {
      await new Startup()
        .use(async (ctx, next) => {
          testResultAfter2000ms(
            ctx,
            async (server) => {
              await supertest(server)
                .get("/dir")
                .expect(hideDir ? 404 : 200)
                .expect(
                  (hideDir ? /<span>404<\/span>/ : /<ul id="files">/) as any,
                )
                .expect("content-type", "text/html");
            },
            (err) => (err ? reject(err) : resolve()),
          );
          await next();
        })
        .use(async (ctx) => {
          await startServer(ctx, [
            "serve",
            "test/serve",
            "--port",
            getPort().toString(),
            ...(hideDir ? ["--hideDir"] : []),
          ]);
        })
        .test();
    });
  }

  it("should list dir", async () => {
    await runTest(undefined);
  });

  it("should be 404 when hideDir is true", async () => {
    await runTest(true);
  });
});

describe("app", () => {
  it("should serve process.cwd() when arg app is undefined", async () => {
    await runin("test/serve", async () => {
      await new Promise<void>(async (resolve, reject) => {
        await new Startup()
          .use(async (ctx, next) => {
            testResultAfter2000ms(
              ctx,
              async (server) => {
                await supertest(server)
                  .get("/")
                  .expect(200)
                  .expect("test")
                  .expect("content-type", "text/html");
              },
              (err) => (err ? reject(err) : resolve()),
            );
            await next();
          })
          .use(async (ctx) => {
            await startServer(ctx, ["serve"]);
          })
          .test();
      });
    });
  });
});
