import * as http from "http";
import HttpStartup from "./HttpStartup";

export default class SfaHttp extends HttpStartup {
  readonly server: http.Server;

  constructor(private readonly serverOptions?: http.ServerOptions) {
    super();
    if (this.serverOptions) {
      this.server = http.createServer(this.serverOptions, this.requestListener);
    } else {
      this.server = http.createServer(this.requestListener);
    }
  }
}
