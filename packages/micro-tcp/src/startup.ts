import { parseTcpBuffer, ServerPacket } from "@halsp/micro-common";
import "@halsp/micro";
import { MicroTcpOptions } from "./options";
import * as net from "net";
import {
  closeServer,
  Context,
  getHalspPort,
  logAddress,
  Startup,
} from "@halsp/core";
import { handleMessage } from "@halsp/micro";

declare module "@halsp/core" {
  interface Startup {
    useMicroTcp(options?: MicroTcpOptions): this;
    get server(): net.Server;

    listen(): Promise<net.Server>;
    close(): Promise<void>;

    register(
      pattern: string,
      handler?: (ctx: Context) => Promise<void> | void
    ): this;
  }
}

const usedMap = new WeakMap<Startup, boolean>();
Startup.prototype.useMicroTcp = function (options?: MicroTcpOptions) {
  if (usedMap.get(this)) {
    return this;
  }
  usedMap.set(this, true);

  initStartup.call(this, options);

  return this.useMicro();
};

function initStartup(this: Startup, options?: MicroTcpOptions) {
  const handlers: {
    pattern: string;
    handler?: (ctx: Context) => Promise<void> | void;
  }[] = [];

  const listener = (socket: net.Socket) =>
    requestListener.bind(this)(socket, handlers);
  let server: net.Server;
  if (!!options) {
    server = net.createServer(options, listener);
  } else {
    server = net.createServer(listener);
  }
  Object.defineProperty(this, "server", {
    configurable: true,
    enumerable: true,
    get: () => server,
  });

  this.extend("listen", async () => {
    await closeServer(this.server);

    if (options?.handle) {
      await new Promise<void>((resolve) => {
        return this.server.listen(options.handle, () => resolve());
      });
    } else {
      await new Promise<void>((resolve) => {
        return this.server.listen(
          {
            ...options,
            port: getHalspPort(options?.port ?? 2333),
          },
          () => resolve()
        );
      });
    }
    return this.server;
  })
    .extend("close", async () => {
      await closeServer(this.server);
      this.logger.info("Server shutdown success");
    })
    .extend(
      "register",
      (pattern: string, handler?: (ctx: Context) => Promise<void> | void) => {
        this.logger.debug(`Add pattern: ${pattern}`);
        handlers.push({ pattern, handler });
        return this;
      }
    );

  this.server.on("listening", () => {
    logAddress(this.server, this.logger, "localhost");
  });
}

function requestListener(
  this: Startup,
  socket: net.Socket,
  handlers: {
    pattern: string;
    handler?: (ctx: Context) => Promise<void> | void;
  }[]
) {
  socket.on("data", async (buffer) => {
    try {
      parseTcpBuffer(buffer, async (packet) => {
        try {
          const pattern = (packet as ServerPacket).pattern;
          const handler = handlers.filter((item) => item.pattern == pattern)[0];
          if (!handler) {
            if (packet.id) {
              writeData(socket, {
                id: packet.id,
                error: `Can't find the pattern: ${pattern}`,
              });
            } else {
              this.logger.info(`Can't find the pattern: ${pattern}`);
              writeData(socket, {
                error: `Can't find the pattern: ${pattern}`,
              });
            }
            return;
          }

          await handleMessage.bind(this)(
            packet as ServerPacket,
            ({ result }) => {
              writeData(socket, result);
            },
            async (ctx) => {
              Object.defineProperty(ctx, "socket", {
                configurable: true,
                enumerable: true,
                get: () => socket,
              });
              handler.handler && (await handler.handler(ctx));
            }
          );
        } catch (err) {
          this.logger.error(err);
          writeData(socket, {
            id: packet.id,
            error: `Internal Error`,
          });
        }
      });
    } catch (err) {
      this.logger.debug("parse tcp buffer error", err);
      writeData(socket, {
        error: (err as Error).message,
      });
    }
  });
  socket.on("close", () => {
    //
  });
  socket.on("error", (err) => {
    this.logger.error(err);
  });
}

function writeData(socket: net.Socket, data: any) {
  const jsonResult = JSON.stringify(data);
  socket.write(`${jsonResult.length}#${jsonResult}`, "utf-8");
}
