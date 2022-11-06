import { Context, Request, Response } from "@ipare/core";
import {
  MicroRedisOptions,
  MicroRedisStartup,
  MicroRedisConnection,
} from "@ipare/micro-redis";
import { initBaseTestStartup, ITestStartup } from "../test-startup";
import {
  mockConnection,
  mockConnectionFrom,
} from "@ipare/micro-redis/dist/mock";

export class TestMicroRedisStartup extends MicroRedisStartup {
  constructor(options?: MicroRedisOptions) {
    super(options);
    initBaseTestStartup(this);
  }

  mockConnection() {
    mockConnection.bind(this)();
    return this;
  }

  mockConnectionFrom(target: MicroRedisConnection<MicroRedisOptions>) {
    mockConnectionFrom.bind(this)(target);
    return this;
  }

  protected async invoke(ctx: Request | Context): Promise<Response> {
    return await super.invoke(ctx);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestMicroRedisStartup extends ITestStartup {}
