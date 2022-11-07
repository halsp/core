import * as nats from "nats";
import { MicroNatsClientOptions, MicroNatsOptions } from "./options";

export abstract class MicroNatsConnection<
  T extends MicroNatsOptions | MicroNatsClientOptions =
    | MicroNatsOptions
    | MicroNatsClientOptions
> {
  protected readonly prefix!: string;
  protected readonly options!: T;

  protected connection?: nats.NatsConnection;

  protected async closeClients(): Promise<void> {
    if (this.connection && !this.connection.isClosed()) {
      await this.connection.close();
    }
  }

  protected async initClients(): Promise<void> {
    await this.closeClients();

    const opt: any = { ...this.options };
    delete opt.host;
    opt.port = this.options.port ?? 4222;
    opt.services = this.options.host ?? "localhost";

    this.connection = await nats.connect(opt);
  }
}

export async function initNatsConnection<
  T extends MicroNatsOptions | MicroNatsClientOptions =
    | MicroNatsOptions
    | MicroNatsClientOptions
>(this: MicroNatsConnection<T>) {
  this.closeClients = MicroNatsConnection.prototype.closeClients.bind(this);
  this.initClients = MicroNatsConnection.prototype.initClients.bind(this);
  Object.defineProperty(this, "prefix", {
    configurable: true,
    enumerable: true,
    get: () => this.options.prefix ?? "",
  });
}
