import { MicroNatsClient, MicroNatsConnection } from "@ipare/micro-nats";
import {
  mockConnection,
  mockConnectionFrom,
} from "@ipare/micro-nats/dist/mock";

export class TestMicroNatsClient extends MicroNatsClient {
  mockConnection() {
    mockConnection.bind(this)();
    return this;
  }

  mockConnectionFrom(target: MicroNatsConnection) {
    mockConnectionFrom.bind(this)(target);
    return this;
  }
}
