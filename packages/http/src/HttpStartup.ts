import * as net from "net";
import * as tls from "tls";
import BaseHttpStartup from "./BaseHttpStartup";

export default abstract class HttpStartup extends BaseHttpStartup {
  abstract readonly server: net.Server | tls.Server;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public get listen() {
    return this.server.listen.bind(this.server);
  }
}
