import { ServerPacket } from "@ipare/micro-common";
import type nats from "nats";
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

  async connect() {
    await this.#close();

    const opt: MicroNatsClientOptions = { ...this.options };
    if (!("servers" in this.options) && !("port" in this.options)) {
      opt.port = 4222;
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.connection = await require("nats").connect(opt);
  }

  async #close() {
    if (this.connection && !this.connection.isClosed()) {
      await this.connection.close();
    }
  }

  /**
   * for @ipare/inject
   */
  async dispose() {
    await this.#close();
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
        headers: createHeaders(),
      };
    }

    pattern = this.prefix + pattern;
    const packet = super.createServerPacket(pattern, data, true);

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

          if (err && !msg.data) {
            resolve({
              error: err.message,
              headers: createHeaders(),
            });
            return;
          }

          const clientPacket = this.#jsonCodec.decode(msg.data);
          resolve({
            data: clientPacket.data ?? clientPacket.response,
            error: err?.message ?? clientPacket.error,
            headers: msg.headers as nats.MsgHdrs,
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
            headers: createHeaders(),
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
    const packet = super.createServerPacket(pattern, data, false);
    this.#sendPacket(packet, headers);
  }

  #sendPacket(packet: ServerPacket, headers?: nats.MsgHdrs, reply?: string) {
    const connection = this.connection as nats.NatsConnection;

    connection.publish(packet.pattern, this.#jsonCodec.encode(packet), {
      reply: reply,
      headers: headers,
    });
  }
}

function createHeaders() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const natsPkg = require("nats");
  return natsPkg.headers() as nats.MsgHdrs;
}
