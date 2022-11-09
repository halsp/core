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

  private connectResolve?: (err: void) => void;

  protected async closeClients(force?: boolean): Promise<void> {
    if (this.connectResolve) {
      this.connectResolve();
      this.connectResolve = undefined;
    }

    this.client?.end(force);
    this.client?.removeAllListeners();
  }

  protected async initClients(): Promise<void> {
    await this.closeClients(true);

    const opt: any = { ...this.options };
    delete opt.host;
    opt.port = this.options.port ?? 1883;
    opt.services = this.options.host ?? "localhost";

    return await new Promise((resolve) => {
      this.connectResolve = resolve;
      this.client = mqtt.connect(this.options);
      this.client.on("connect", () => {
        resolve();
      });
      this.client.on("error", (err) => {
        this["logger"] && this["logger"].error(err);
        resolve();
      });
    });
  }
}

export function initMqttConnection<
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
