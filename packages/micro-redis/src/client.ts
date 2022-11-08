import { MicroClient, parseBuffer } from "@ipare/micro";
import { MicroRedisClientOptions } from "./options";
import { initRedisConnection, MicroRedisConnection } from "./connection";

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
    data: any
  ): Promise<{
    data?: T;
    error?: string;
  }> {
    const packet = super.createPacket(pattern, data, true);

    const sub = this.sub as Exclude<typeof this.pub, undefined>;
    return new Promise(async (resolve) => {
      await sub.subscribe(
        this.prefix + pattern + "." + packet.id,
        (buffer) => {
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
    const packet = super.createPacket(pattern, data, false);
    this.#sendPacket(packet);
  }

  #sendPacket(packet: any) {
    const json = JSON.stringify(packet);
    const str = `${json.length}#${json}`;
    this.pub?.publish(this.prefix + packet.pattern, str);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MicroRedisClient
  extends MicroRedisConnection<MicroRedisClientOptions> {}
