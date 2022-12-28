import * as net from "net";
import { ILogger } from "../logger";
import { isObject } from "./typeis";

export function getIparePort(port: number): number;
export function getIparePort(port?: number): number | undefined;
export function getIparePort(port?: number) {
  if (process.env.IPARE_DEBUG_PORT) {
    return Number(process.env.IPARE_DEBUG_PORT);
  } else {
    return port;
  }
}

export async function dynamicListen(
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

  return await tryListen(getIparePort(port) ?? 9504);
}

export function logAddress(
  server: net.Server,
  logger: ILogger,
  defaultHost: string
) {
  const address = server.address();
  if (isObject<net.AddressInfo>(address)) {
    const host = address.address == "::" ? defaultHost : address.address;
    logger.info(`Server started, listening address: ${host}:${address.port}`);
  } else {
    logger.info(`Server started, listening address: ${address}`);
  }
}

export async function closeServer(server: net.Server, logger: ILogger) {
  server.removeAllListeners();
  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
  logger.info("Server shutdown success");
}
