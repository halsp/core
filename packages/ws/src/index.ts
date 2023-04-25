import { HttpStartup } from "@halsp/http";
import { Manager } from "./manager";
import { Options } from "./options";
import "@halsp/inject";
import * as ws from "ws";
import { WebSocket } from "./decorator";

declare module "@halsp/http" {
  interface HttpStartup {
    useWebSocket(options?: Options): this;
  }
}

declare module "@halsp/core" {
  interface Context {
    acceptWebSocket(): Promise<WebSocket>;
    tryAcceptWebSocket(): Promise<WebSocket | null>;
    get webSocketClients(): Set<WebSocket>;
  }
}

HttpStartup.prototype.useWebSocket = function (
  options: Options = {}
): HttpStartup {
  const wss = new ws.Server({
    ...options,
    noServer: true,
  });
  return this.useInject().use(async (ctx, next) => {
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

export { Options };
export { WebSocket } from "./decorator";
