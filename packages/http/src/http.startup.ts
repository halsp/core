import * as http from "http";
import { BaseStartup } from "./base.startup";

export class HttpStartup extends BaseStartup<http.Server> {
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
