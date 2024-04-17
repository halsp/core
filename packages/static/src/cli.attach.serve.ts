import { Startup, getAvailablePort } from "@halsp/core";
import type { Command } from "commander";
import type {} from "@halsp/native";
import path from "path";

export const HALSP_CLI_PLUGIN_ATTACH = {
  register,
  dependencies: ["@halsp/native"],
};

async function register(command: Command) {
  command
    .command("serve")
    .argument("[app]", "Where is the app")
    .description("Serve static web by @halsp/static and @halsp/native")
    .option("-p, --port <port>", "The port on http listens")
    .option("--hostname <hostname>", "The hostname on http listens")
    .option("--hideDir", "Do not list dir")
    .option(
      "--exclude <files>",
      'Exclude files, glob string, separate with space (e.g. "**/*.key secret/*.crt")',
    )
    .option("--prefix <prefix>", "File prefix")
    .option("--encoding <encoding>", "Buffer encoding (e.g. utf8)")
    .action(async (app: string, args: Record<string, boolean | string>) => {
      if (!app) {
        await serve(command, args);
      } else {
        const cwd = process.cwd();
        process.chdir(path.resolve(app));
        try {
          await serve(command, args);
        } finally {
          process.chdir(cwd);
        }
      }
    });
}

async function serve(command: Command, args: Record<string, boolean | string>) {
  const port =
    Number(args.port) || (await getAvailablePort(args.hostname as string));
  const server = await new Startup()
    .useNative({
      port: port,
      host: args.hostname as string,
    })
    .useStatic({
      dir: process.cwd(),
      listDir: !args.hideDir,
      use404: true,
      useIndex: true,
      method: "ANY",
      useExt: true,
      exclude: args.exclude as string,
      prefix: args.prefix as string,
      encoding: args.encoding as BufferEncoding,
    })
    .listen();
  Object.defineProperty(command, "@halsp/static/serve/server", {
    enumerable: false,
    value: server,
    configurable: true,
    writable: false,
  });

  await new Promise((resolve, reject) => {
    server.on("close", resolve);
    server.on("error", reject);
  });
}
