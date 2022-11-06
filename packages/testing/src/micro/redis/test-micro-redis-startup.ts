import { Context, Request, Response } from "@ipare/core";
import { MicroRedisOptions, MicroRedisStartup } from "@ipare/micro/dist/redis";
import {
  initRedisConnection,
  RedisConnection,
} from "@ipare/micro/dist/redis/connection";
import { initBaseTestStartup, ITestStartup } from "../../test-startup";
import { mockConnection, mockConnectionFrom } from "./mock";

export class TestMicroRedisStartup extends MicroRedisStartup {
  constructor(options?: MicroRedisOptions) {
    super(options);
    initRedisConnection.bind(this)();
    initBaseTestStartup(this);
  }

  mockConnection() {
    mockConnection.bind(this)();
    return this;
  }

  mockConnectionFrom(target: RedisConnection) {
    mockConnectionFrom.bind(this)(target);
    return this;
  }

  protected async invoke(ctx: Request | Context): Promise<Response> {
    return await super.invoke(ctx);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestMicroRedisStartup extends ITestStartup {}
