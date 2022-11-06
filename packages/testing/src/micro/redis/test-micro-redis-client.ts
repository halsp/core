import {
  MicroRedisClient,
  MicroRedisClientOptions,
} from "@ipare/micro/dist/redis";
import {
  initRedisConnection,
  RedisConnection,
} from "@ipare/micro/dist/redis/connection";
import { mockConnection, mockConnectionFrom } from "./mock";

export class TestMicroRedisClient extends MicroRedisClient {
  protected pub: RedisConnection["pub"];
  protected sub: RedisConnection["sub"];
  protected initClients!: RedisConnection["initClients"];
  protected closeClients!: RedisConnection["closeClients"];

  constructor(options?: MicroRedisClientOptions) {
    super(options);
    initRedisConnection.bind(this)();
  }

  mockConnection() {
    mockConnection.bind(this)();
    return this;
  }

  mockConnectionFrom(target: RedisConnection) {
    mockConnectionFrom.bind(this)(target);
    return this;
  }
}
