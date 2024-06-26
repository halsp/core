import "@halsp/http";
import "@halsp/inject";
import { Manager } from "./manager";
import { WsOptions } from "./options";
import ws from "ws";
import { WebSocket } from "./decorator";
import { Startup } from "@halsp/core";

declare module "@halsp/core" {
  interface Startup {
    useWebSocket(options?: WsOptions): this;
    close(): Promise<void>;
  }
  interface Context {
    acceptWebSocket(): Promise<WebSocket>;
    tryAcceptWebSocket(): Promise<WebSocket | null>;
    get webSocketClients(): Set<WebSocket>;
  }
}

Startup.prototype.useWebSocket = function (options: WsOptions = {}) {
  const wss = new ws.Server({
    ...options,
    noServer: true,
  });

  return this.extend(
    "close",
    () =>
      new Promise<void>((resolve, reject) => {
        wss.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }),
  )
    .useInject()
    .useHttp()
    .use(async (ctx, next) => {
      let manager!: Manager;

      Object.defineProperty(ctx, "webSocketClients", {
        enumerable: true,
        configurable: true,
        get: () => wss.clients,
      });

      ctx.acceptWebSocket = async () => {
        if (!manager) {
          manager = new Manager(ctx, options, wss);
        }
        return await manager.accept();
      };
      ctx.tryAcceptWebSocket = async () => {
        if (!manager) {
          manager = new Manager(ctx, options, wss);
        }
        return await manager.tryAccept();
      };

      await next();

      await manager?.untilClosed();
    });
};

export { WsOptions };
export { WebSocket } from "./decorator";
