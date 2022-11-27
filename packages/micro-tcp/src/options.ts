import * as net from "net";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MicroTcpOptions extends net.ListenOptions {
  serverOpts?: net.ServerOpts;
  /**
   * Start a server listening for connections. A net.Server can be a TCP or an IPC server depending on what it listens to.
   *
   * signature: server.listen(handle[, backlog][, callback])
   */
  handle?: any;
  listeningListener?: () => void;
}
