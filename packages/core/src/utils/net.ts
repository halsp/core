import * as net from "net";
import { ILogger } from "../logger";
import { isObject } from "./typeis";

function getPort(port?: number) {
  if (process.env.IPARE_DEBUG_PORT) {
    return Number(process.env.IPARE_DEBUG_PORT);
  } else {
    return port;
  }
}

export function netListen(server: net.Server, ...args: any[]) {
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

export async function netDynamicListen(
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

export function logNetListen(server: net.Server, logger: ILogger) {
  const address = server.address();
  if (isObject<net.AddressInfo>(address)) {
    const host = address.address == "::" ? "http://localhost" : address.address;
    logger.info(`Server started, listening address: ${host}:${address.port}`);
  } else {
    logger.info(`Server started, listening address: ${address}`);
  }
}

export async function netClose(server: net.Server, logger: ILogger) {
  server.removeAllListeners();
  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
  logger.info("Server shutdown success");
}
