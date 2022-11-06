import {
  MicroRedisClient,
  MicroRedisConnection,
} from "@ipare/micro/dist/redis";
import { mockConnection, mockConnectionFrom } from "./mock";

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
