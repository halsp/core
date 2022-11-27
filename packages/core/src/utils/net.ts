import * as net from "net";
import { ILogger } from "../logger";
import { isObject } from "./typeis";

export interface IpareNetListener<T extends net.Server = net.Server> {
  listen(
    port?: number,
    hostname?: string,
    backlog?: number,
    listeningListener?: () => void
  ): T;
  listen(port?: number, hostname?: string, listeningListener?: () => void): T;
  listen(port?: number, backlog?: number, listeningListener?: () => void): T;
  listen(port?: number, listeningListener?: () => void): T;
  listen(path: string, backlog?: number, listeningListener?: () => void): T;
  listen(path: string, listeningListener?: () => void): T;
  listen(options: net.ListenOptions, listeningListener?: () => void): T;
  listen(handle: any, backlog?: number, listeningListener?: () => void): T;
  listen(handle: any, listeningListener?: () => void): T;

  dynamicListen(
    port?: number,
    hostname?: string,
    backlog?: number,
    listeningListener?: () => void
  ): Promise<{ port: number; server: T }>;
  dynamicListen(
    port?: number,
    hostname?: string,
    listeningListener?: () => void
  ): Promise<{ port: number; server: T }>;
  dynamicListen(
    port?: number,
    backlog?: number,
    listeningListener?: () => void
  ): Promise<{ port: number; server: T }>;

  logger: ILogger;
}

function getPort(port?: number) {
  if (process.env.IPARE_DEBUG_PORT) {
    return Number(process.env.IPARE_DEBUG_PORT);
  } else {
    return port;
  }
}

function listen(server: net.Server, ...args: any[]) {
  if (typeof args[0] == "object") {
    if ("handle" in args[0] || "_handle" in args[0] || "fd" in args[0]) {
      return server.listen(...args);
    } else {
      args[0] = { ...args[0], port: getPort(args[0].port) };
      return server.listen(...args);
    }
  } else if (typeof args[0] == "number") {
    args[0] = getPort(args[0]);
    return server.listen(...args);
  } else if (typeof args[0] == "string") {
    return server.listen(...args);
  } else {
    return server.listen(getPort());
  }
}

async function dynamicListen(
  server: net.Server,
  port?: number,
  ...args: any[]
) {
  function tryListen(port: number) {
    return new Promise<number>((resolve, reject) => {
      let error = false;
      let listen = false;
      server.listen(port, ...args);
      server.once("listening", () => {
        listen = true;
        if (error) return;

        resolve(port as number);
      });
      server.once("error", (err) => {
        error = true;
        if (listen) return;

        server.close();
        if ((err as any).code == "EADDRINUSE") {
          tryListen(port + 1).then((svr) => {
            resolve(svr);
          });
        } else {
          reject(err);
        }
      });
    });
  }

  return await tryListen(getPort(port ?? 2333) as number);
}

export function initNetListener<T extends net.Server = net.Server>(
  listener: IpareNetListener,
  server: T
) {
  listener.listen = (...args: any[]) => listen(server, ...args);
  listener.dynamicListen = async (...args: any[]) => {
    const realPort = await dynamicListen(server, ...args);
    return {
      port: realPort,
      server,
    };
  };
  server.on("listening", () => {
    const address = server.address();
    if (isObject<net.AddressInfo>(address)) {
      const host =
        address.address == "::" ? "http://localhost" : address.address;
      listener.logger.info(
        `Server started, listening address: ${host}:${address.port}`
      );
    } else {
      listener.logger.info(`Server started, listening address: ${address}`);
    }
  });
}
