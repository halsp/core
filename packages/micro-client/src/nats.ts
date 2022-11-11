import { parseBuffer } from "@ipare/micro";
import type nats from "nats";
import { MicroClient } from "./base";

export interface MicroNatsClientOptions
  extends Omit<nats.ConnectionOptions, "services"> {
  host?: string;
  prefix?: string;
  sendTimeout?: number;
}

export class MicroNatsClient extends MicroClient {
  constructor(protected readonly options: MicroNatsClientOptions = {}) {
    super();
  }

  protected connection?: nats.NatsConnection;
  protected get prefix() {
    return this.options.prefix ?? "";
  }

  async connect() {
    await this.#close();

    const opt: any = { ...this.options };
    delete opt.host;
    opt.port = this.options.port ?? 4222;
    opt.services = this.options.host ?? "localhost";

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const natsPkg = require("nats");
    this.connection = await natsPkg.connect(opt);
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

          if (err && !msg.data) {
            resolve({
              error: err.message,
              headers: createHeaders(),
            });
            return;
          }

          parseBuffer(Buffer.from(msg.data), (packet) => {
            resolve({
              data: packet.data ?? packet.response,
              error: err?.message ?? packet.error,
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

function createHeaders() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const natsPkg = require("nats");
  return natsPkg.headers() as nats.MsgHdrs;
}
