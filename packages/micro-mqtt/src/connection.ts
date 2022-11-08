import * as mqtt from "mqtt";
import { MicroMqttClientOptions, MicroMqttOptions } from "./options";

export abstract class MicroMqttConnection<
  T extends MicroMqttOptions | MicroMqttClientOptions =
    | MicroMqttOptions
    | MicroMqttClientOptions
> {
  protected readonly prefix!: string;
  protected readonly options!: T;

  protected client?: mqtt.MqttClient;

  protected async closeClients(): Promise<void> {
    if (this.client && this.client.connected) {
      this.client.end();
    }
  }

  protected async initClients(): Promise<void> {
    await this.closeClients();

    const opt: any = { ...this.options };
    delete opt.host;
    opt.port = this.options.port ?? 1883;
    opt.services = this.options.host ?? "localhost";

    return await new Promise((resolve) => {
      this.client = mqtt.connect(this.options);
      this.client.on("connect", () => {
        resolve();
      });
    });
  }
}

export async function initMqttConnection<
  T extends MicroMqttOptions | MicroMqttClientOptions =
    | MicroMqttOptions
    | MicroMqttClientOptions
>(this: MicroMqttConnection<T>) {
  this.closeClients = MicroMqttConnection.prototype.closeClients.bind(this);
  this.initClients = MicroMqttConnection.prototype.initClients.bind(this);
  Object.defineProperty(this, "prefix", {
    configurable: true,
    enumerable: true,
    get: () => this.options.prefix ?? "",
  });
}
