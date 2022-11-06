import { MicroRedisClient, MicroRedisConnection } from "@ipare/micro-redis";
import {
  mockConnection,
  mockConnectionFrom,
} from "@ipare/micro-redis/dist/mock";

export class TestMicroRedisClient extends MicroRedisClient {
  mockConnection() {
    mockConnection.bind(this)();
    return this;
  }

  mockConnectionFrom(target: MicroRedisConnection) {
    mockConnectionFrom.bind(this)(target);
    return this;
  }
}
