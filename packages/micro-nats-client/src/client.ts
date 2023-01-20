import { ClientPacket, ServerPacket } from "@ipare/micro-common";
import * as nats from "nats";
import { IMicroClient } from "@ipare/micro-client";
import { MicroNatsClientOptions } from "./options";

export class MicroNatsClient extends IMicroClient {
  constructor(protected readonly options: MicroNatsClientOptions = {}) {
    super();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.#jsonCodec = require("nats").JSONCodec();
  }

  #jsonCodec!: nats.Codec<any>;
  protected connection?: nats.NatsConnection;
  protected get prefix() {
    return this.options.prefix ?? "";
  }

  protected async connect() {
    const opt: MicroNatsClientOptions = { ...this.options };
    if (!("servers" in this.options) && !("port" in this.options)) {
      opt.port = 4222;
    }

    this.connection = await nats.connect(opt);
  }

  async dispose() {
    if (this.connection && !this.connection.isClosed()) {
      await this.connection.close();
    }
  }

  async send<T = any>(
    pattern: string,
    data: any,
    options: Omit<nats.SubscriptionOptions, "callback"> & {
      timeout?: number;
      headers?: nats.MsgHdrs;
    } = {}
  ): Promise<{
    data: T;
    headers: nats.MsgHdrs;
  }> {
    if (!this.connection || this.connection.isClosed()) {
      throw new Error("The connection is not connected");
    }

    pattern = this.prefix + pattern;
    const packet = super.createServerPacket(pattern, data, true);

    const connection: nats.NatsConnection = this.connection as Exclude<
      typeof this.connection,
      undefined
    >;

    let timeoutInstance: NodeJS.Timeout | undefined;
    return await new Promise(async (resolve, reject) => {
      const reply = pattern + "." + packet.id;
      const sub = connection.subscribe(reply, {
        ...this.options.subscribeOptions,
        ...options,
        callback: (err, msg) => {
          sub.unsubscribe();

          if (timeoutInstance) {
            clearTimeout(timeoutInstance);
          }

          if (err) {
            reject(err);
            return;
          }

          const clientPacket: ClientPacket = this.#jsonCodec.decode(msg.data);
          if (clientPacket.error) {
            reject(new Error(clientPacket.error));
            return;
          }

          resolve({
            data: clientPacket.data ?? clientPacket["response"],
            headers: msg.headers as nats.MsgHdrs,
          });
        },
      });

      const sendTimeout = options.timeout ?? this.options.sendTimeout ?? 10000;
      if (sendTimeout != 0) {
        timeoutInstance = setTimeout(() => {
          timeoutInstance = undefined;
          sub.unsubscribe();
          reject(new Error("Send timeout"));
        }, sendTimeout);
      }

      this.#sendPacket(packet, options.headers, reply);
    });
  }

  emit(
    pattern: string,
    data: any,
    options: {
      headers?: nats.MsgHdrs;
    } = {}
  ): void {
    if (!this.connection || this.connection.isClosed()) {
      throw new Error("The connection is not connected");
    }

    pattern = this.prefix + pattern;
    const packet = super.createServerPacket(pattern, data, false);
    this.#sendPacket(packet, options.headers);
  }

  #sendPacket(packet: ServerPacket, headers?: nats.MsgHdrs, reply?: string) {
    const connection = this.connection as nats.NatsConnection;

    connection.publish(packet.pattern, this.#jsonCodec.encode(packet), {
      reply: reply,
      headers: headers,
    });
  }
}
