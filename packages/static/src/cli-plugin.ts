import { Startup } from "@halsp/core";
import type { Command } from "commander";
import type {} from "@halsp/native";
import path from "path";
import net from "net";

export const HALSP_CLI_PLUGIN_ATTACH = {
  register,
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
    .action(async (app: string, command: Record<string, boolean | string>) => {
      if (!app) {
        await serve(command);
      } else {
        const cwd = process.cwd();
        process.chdir(path.resolve(app));
        try {
          await serve(command);
        } finally {
          process.chdir(cwd);
        }
      }
    });
}

async function serve(command: Record<string, boolean | string>) {
  const port =
    Number(command.port) ||
    (await getAvailablePort(command.hostname as string));
  const server = await new Startup()
    .useNative({
      port: port,
      host: command.hostname as string,
    })
    .useStatic({
      dir: process.cwd(),
      listDir: !command.hideDir,
      use404: true,
      useIndex: true,
      method: "ANY",
      useExt: true,
      exclude: command.exclude as string,
      prefix: command.prefix as string,
      encoding: command.encoding as BufferEncoding,
    })
    .listen();

  await new Promise((resolve, reject) => {
    server.on("close", resolve);
    server.on("error", reject);
  });
}

async function getAvailablePort(host: string) {
  const checkPort = (port: number) => {
    return new Promise<void>((resolve, reject) => {
      const server = net.createServer();
      server.unref();
      server.on("error", reject);

      server.listen(port, host, () => {
        server.close(() => {
          resolve();
        });
      });
    });
  };
  for (let i = 9504; i < 9600; i++) {
    try {
      await checkPort(i);
      return i;
    } catch (err) {
      const error = err as any;
      if (!["EADDRNOTAVAIL", "EINVAL"].includes(error.code)) {
        throw error;
      }
    }
  }
}
