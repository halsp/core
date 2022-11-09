import { MicroClient, parseBuffer } from "@ipare/micro";
import { MicroNatsClientOptions } from "./options";
import { initNatsConnection, MicroNatsConnection } from "./connection";
import * as nats from "nats";

export class MicroNatsClient extends MicroClient {
  constructor(protected readonly options: MicroNatsClientOptions = {}) {
    super();
    initNatsConnection.bind(this)();
  }

  async connect() {
    await this.initClients();
  }

  /**
   * for @ipare/inject
   */
  async dispose() {
    await this.closeClients();
  }

  async send<T = any>(
    pattern: string,
    data: any,
    headers?: nats.MsgHdrs,
    timeout?: number
  ): Promise<{
    data?: T;
    error?: string;
    headers: nats.MsgHdrs;
  }> {
    if (!this.connection || this.connection.isClosed()) {
      return {
        error: "The connection is not connected",
        headers: nats.headers(),
      };
    }

    pattern = this.prefix + pattern;
    const packet = super.createPacket(pattern, data, true);

    const connection: nats.NatsConnection = this.connection as Exclude<
      typeof this.connection,
      undefined
    >;

    let timeoutInstance: NodeJS.Timeout | undefined;
    return await new Promise(async (resolve) => {
      const reply = pattern + "." + packet.id;
      const sub = connection.subscribe(reply, {
        callback: (err, msg) => {
          sub.unsubscribe();

          if (timeoutInstance) {
            clearTimeout(timeoutInstance);
          }

          if (err) {
            resolve({
              error: err.message,
              headers: nats.headers(),
            });
            return;
          }

          parseBuffer(Buffer.from(msg.data), (packet) => {
            resolve({
              data: packet.data ?? packet.response,
              error: packet.error,
              headers: msg.headers as nats.MsgHdrs,
            });
          });
        },
      });

      const sendTimeout = timeout ?? this.options.sendTimeout ?? 10000;
      if (sendTimeout != 0) {
        timeoutInstance = setTimeout(() => {
          timeoutInstance = undefined;
          sub.unsubscribe();
          resolve({
            error: "Send timeout",
            headers: nats.headers(),
          });
        }, sendTimeout);
      }

      this.#sendPacket(packet, headers, reply);
    });
  }

  emit(pattern: string, data: any, headers?: nats.MsgHdrs): void {
    if (!this.connection || this.connection.isClosed()) {
      throw new Error("The connection is not connected");
    }

    pattern = this.prefix + pattern;
    const packet = super.createPacket(pattern, data, false);
    this.#sendPacket(packet, headers);
  }

  #sendPacket(packet: any, headers?: nats.MsgHdrs, reply?: string) {
    const json = JSON.stringify(packet);
    const str = `${json.length}#${json}`;

    const connection = this.connection as nats.NatsConnection;
    connection.publish(packet.pattern, Buffer.from(str, "utf-8"), {
      reply: reply,
      headers: headers,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MicroNatsClient
  extends MicroNatsConnection<MicroNatsClientOptions> {}
