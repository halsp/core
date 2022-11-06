import { Context, Request, Response } from "@ipare/core";
import {
  MicroNatsOptions,
  MicroNatsStartup,
  MicroNatsConnection,
} from "@ipare/micro-nats";
import { initBaseTestStartup, ITestStartup } from "../test-startup";
import {
  mockConnection,
  mockConnectionFrom,
} from "@ipare/micro-nats/dist/mock";

export class TestMicroNatsStartup extends MicroNatsStartup {
  constructor(options?: MicroNatsOptions) {
    super(options);
    initBaseTestStartup(this);
  }

  mockConnection() {
    mockConnection.bind(this)();
    return this;
  }

  mockConnectionFrom(target: MicroNatsConnection<MicroNatsOptions>) {
    mockConnectionFrom.bind(this)(target);
    return this;
  }

  protected async invoke(ctx: Request | Context): Promise<Response> {
    return await super.invoke(ctx);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestMicroNatsStartup extends ITestStartup {}
