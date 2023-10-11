import * as net from "net";
import { ILogger } from "../logger";
import { isObject } from "./typeis";

export function getHalspPort(port: number): number;
export function getHalspPort(port?: number): number | undefined;
export function getHalspPort(port?: number) {
  if (process.env.HALSP_DEBUG_PORT) {
    return Number(process.env.HALSP_DEBUG_PORT);
  } else {
    return port;
  }
}

export function logAddress(
  server: net.Server,
  logger: ILogger,
  defaultHost: string,
) {
  const address = server.address();
  if (isObject<net.AddressInfo>(address)) {
    const host = address.address == "::" ? defaultHost : address.address;
    logger.info(`Server started, listening address: ${host}:${address.port}`);
  } else {
    logger.info(`Server started, listening address: ${address}`);
  }
}

export async function closeServer(server: net.Server) {
  if (!server.address()) {
    return;
  }

  server.removeAllListeners();
  await new Promise<void>((resolve, reject) =>
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    }),
  );
}
