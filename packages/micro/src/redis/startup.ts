import { MicroStartup } from "../";
import { MicroRedisOptions } from "./options";
import { initRedisConnection, RedisConnection } from "./connection";

export class MicroRedisStartup extends MicroStartup {
  constructor(options: MicroRedisOptions = {}) {
    super();
    initRedisConnection.bind(this)(options);
  }

  #handler(buffer: Buffer) {
    this.handleMessage(buffer, async ({ result }) => {
      const pub = this.pub as Exclude<typeof this.pub, undefined>;
      await pub.publish(this.replyChanlel, result);
    });
  }

  async listen() {
    await this.close();
    await this.initClients();

    const pub = this.pub as Exclude<typeof this.pub, undefined>;
    const sub = this.sub as Exclude<typeof this.pub, undefined>;
    await sub.subscribe(this.channel, this.#handler.bind(this), true);
    return { sub, pub };
  }

  async close() {
    await this.sub?.unsubscribe(this.channel);
    await this.closeClients();
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MicroRedisStartup extends RedisConnection {}
