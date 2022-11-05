import { MicroStartup } from "../";
import { MicroRedisOptions } from "./options";
import * as redis from "redis";
import { REDIS_CHANNEL } from "../constant";

export class MicroRedisStartup extends MicroStartup {
  constructor(readonly options: MicroRedisOptions = {}) {
    super();

    const host = options.host ?? "localhost";
    const port = options.port ?? 6379;
    const opt: any = { ...options };
    delete opt.host;
    delete opt.port;
    opt.url = `redis://${host}:${port}`;
    this.#pubClient = redis.createClient(opt);
    this.#subClient = redis.createClient(opt);
  }

  readonly #pubClient: redis.RedisClientType;
  public get pubClient() {
    return this.#pubClient;
  }

  readonly #subClient: redis.RedisClientType;
  public get subClient() {
    return this.#subClient;
  }

  #handler(buffer: Buffer) {
    this.handleMessage(buffer, async ({ result, packet }) => {
      await this.#pubClient.publish(REDIS_CHANNEL + packet.id, result);
    });
  }

  async listen() {
    await Promise.all([this.#pubClient.connect(), this.#subClient.connect()]);
    await this.#subClient.subscribe(
      REDIS_CHANNEL,
      this.#handler.bind(this),
      true
    );
    return this.#subClient;
  }

  async close() {
    await this.#subClient.unsubscribe(REDIS_CHANNEL);
    await Promise.all([
      this.#pubClient.disconnect(),
      this.#subClient.disconnect(),
    ]);
  }
}
