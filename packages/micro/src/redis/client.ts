import { MicroClient, PatternType } from "../";
import { MicroRedisClientOptions } from "./options";
import { parseBuffer } from "../parser";
import { initRedisConnection, RedisConnection } from "./connection";
import { composePattern } from "../pattern";

export class MicroRedisClient extends MicroClient {
  constructor(options?: MicroRedisClientOptions) {
    super();
    initRedisConnection.bind(this)(options);
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

  async send<T = any>(pattern: PatternType, data: any): Promise<T> {
    const packet = super.createPacket(pattern, data, true);

    const sub = this.sub as Exclude<typeof this.pub, undefined>;
    return new Promise(async (resolve) => {
      await sub.subscribe(
        composePattern(pattern) + ".reply",
        (buffer) => {
          parseBuffer(buffer, (packet) => {
            resolve(packet.data ?? packet.response);
          });
        },
        true
      );
      this.#sendPacket(packet);
    });
  }

  emit(pattern: PatternType, data: any): void {
    const packet = super.createPacket(pattern, data, false);
    this.#sendPacket(packet);
  }

  #sendPacket(packet: any) {
    const json = JSON.stringify(packet);
    const str = `${json.length}#${json}`;
    this.pub?.publish(packet.pattern, str);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MicroRedisClient extends RedisConnection {}
