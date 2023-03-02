import { Context, Request, Response } from "@halsp/common";
import { MicroNatsOptions, MicroNatsStartup } from "@halsp/micro-nats";
import { initBaseTestStartup, ITestStartup } from "../test-startup";

export class TestMicroNatsStartup extends MicroNatsStartup {
  constructor(options?: MicroNatsOptions) {
    super(options);
    initBaseTestStartup(this);
  }

  protected async invoke(ctx: Request | Context): Promise<Response> {
    return await super.invoke(ctx);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestMicroNatsStartup extends ITestStartup {}
