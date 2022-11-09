import { MicroClient, parseBuffer } from "@ipare/micro";
import { MicroRedisClientOptions } from "./options";
import { initRedisConnection, MicroRedisConnection } from "./connection";
import * as redis from "redis";

export class MicroRedisClient extends MicroClient {
  constructor(protected readonly options: MicroRedisClientOptions = {}) {
    super();
    initRedisConnection.bind(this)();
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
    timeout?: number
  ): Promise<{
    data?: T;
    error?: string;
  }> {
    if (!this.sub?.isReady || !this.pub?.isReady) {
      return {
        error: "The connection is not connected",
      };
    }

    pattern = this.prefix + pattern;
    const packet = super.createPacket(pattern, data, true);
    const reply = pattern + "." + packet.id;

    const sub = this.sub as Exclude<typeof this.pub, undefined>;
    return new Promise(async (resolve) => {
      let timeoutInstance: NodeJS.Timeout | undefined;
      const sendTimeout = timeout ?? this.options.sendTimeout ?? 10000;
      if (sendTimeout != 0) {
        timeoutInstance = setTimeout(() => {
          sub.unsubscribe(reply);
          resolve({
            error: "Send timeout",
          });
        }, sendTimeout);
      }

      await sub.subscribe(
        reply,
        (buffer) => {
          if (timeoutInstance) {
            clearTimeout(timeoutInstance);
            timeoutInstance = undefined;
          }
          sub.unsubscribe(reply);

          parseBuffer(buffer, (packet) => {
            resolve({
              data: packet.data ?? packet.response,
              error: packet.error,
            });
          });
        },
        true
      );
      this.#sendPacket(packet);
    });
  }

  emit(pattern: string, data: any): void {
    if (!this.sub?.isReady || !this.pub?.isReady) {
      throw new Error("The connection is not connected");
    }

    pattern = this.prefix + pattern;
    const packet = super.createPacket(pattern, data, false);
    this.#sendPacket(packet);
  }

  #sendPacket(packet: any) {
    const json = JSON.stringify(packet);
    const str = `${json.length}#${json}`;

    const pub = this.pub as redis.RedisClientType;
    pub.publish(packet.pattern, str);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MicroRedisClient
  extends MicroRedisConnection<MicroRedisClientOptions> {}
