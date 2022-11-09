import * as net from "net";
import { MicroTcpClient } from "./client";
import { MicroTcpStartup } from "./startup";

export function onSocketClose(
  this: MicroTcpClient | MicroTcpStartup,
  socket: net.Socket
) {
  socket.on("close", () => {
    //
  });
}
