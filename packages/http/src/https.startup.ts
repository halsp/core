import * as https from "https";
import { BaseStartup } from "./base.startup";

export class HttpsStartup extends BaseStartup<https.Server> {
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
