import * as https from "https";
import HttpStartup from "./HttpStartup";

export default class SfaHttp extends HttpStartup {
  readonly server: https.Server;

  constructor(private readonly serverOptions?: https.ServerOptions) {
    super();
    if (this.serverOptions) {
      this.server = https.createServer(
        this.serverOptions,
        this.requestListener
      );
    } else {
      this.server = https.createServer(this.requestListener);
    }
  }
}
